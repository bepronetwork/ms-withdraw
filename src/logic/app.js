import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository, WithdrawRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { Withdraw } from '../models';
import CasinoContract from './eth/CasinoContract';
import { globals } from '../Globals';
import Numbers from './services/numbers';
import { throwError } from '../controllers/Errors/ErrorManager';
import { verifytransactionHashWithdrawApp } from './services/services';
import {  detectCurrencyAmountToSmartContractAmount } from './utils/currencies';
let error = new ErrorManager();



// Private fields
let self; // eslint-disable-line no-unused-vars
let library;
let modules;

let __private = {};



/**
 * Login logic.
 *
 * @class
 * @memberof logic
 * @param {function} params - Function Params
 **/

  
const processActions = {
    __requestWithdraw : async (params) => {
        var app;
        try{
            const { currency, address } = params;
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}

            /* Get App Id */
            app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                account             : globals.getManagerAccount(),
                contractAddress     : wallet.bank_address,
                tokenAddress        : wallet.currency.ticker,
                decimals            : wallet.currency.decimals
            });

            let amount = parseFloat(Math.abs(params.tokenAmount));
            let appBalance = parseFloat(wallet.playBalance);

            /* Get All Users Balance */
            let allUsersBalance = (await UsersRepository.prototype.getAllUsersBalance({app : app._id, currency : wallet.currency._id})).balance;
            if(typeof allUsersBalance != 'number'){throwError('UNKNOWN')}      
            /* Verify if App has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= appBalance);
            let res = {
                max_withdraw: (!wallet.max_withdraw) ? 0 : wallet.max_withdraw,
                allUsersBalance,
                appBalance,
                hasEnoughBalance,
                wallet : wallet,
                currency : wallet.currency,
                withdrawAddress : address,
                amount : amount,
                playBalanceDelta : parseFloat(-Math.abs(amount)),
                casinoContract : casinoContract,
                app         : app,
                nonce       : params.nonce,
            }

            return res;
        }catch(err){
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {

        var params_input = params;
        const { currency } = params;

        /* Get App By Id */
        let app = await AppRepository.prototype.findAppById(params.app);
        if(!app){throwError('APP_NOT_EXISTENT')}
        const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
        if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

        /* Verify if this transactionHashs was already added */
        let withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionHash(params.transactionHash);
        let wasAlreadyAdded = withdraw ? true : false;
        
        withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
        let withdrawExists = withdraw ? true : false;
       
        /* Verify App Balance in API */
        let currentAPIBalance = parseFloat(wallet.playBalance);

        /* Withdraw Occured in the Smart-Contract */
        const { isValid, tokensTransferedTo } = await verifytransactionHashWithdrawApp({
            currency : wallet.currency,
            amount : withdraw.amount,
            transactionHash : params_input.transactionHash,
            platformAddress : wallet.bank_address
        })
    
        /* Verify if Ap Address is Valid */
        let isValidAddress = true;
        
        let res = {
            withdrawExists,
            withdraw_id : params.withdraw_id,
            transactionIsValid : isValid,
            isValidAddress,
            currentAPIBalance,
            wasAlreadyAdded,
            transactionHash     : params.transactionHash,
            currency            : wallet.currency,
            creationDate        : new Date(),
            app,
            withdrawAddress     : tokensTransferedTo
        }
        
        return res;
    },
    __getUsersWithdraws : async (params) => {
        return params;
    }
}



/**
 * Login logic.
 *
 * @class progressActions
 * @memberof logic
 * @param {function} params - Function Params
 **/

  
const progressActions = {
    __requestWithdraw : async (params) => {

        /* Add Withdraw to user */
        var withdraw = new Withdraw({
            app                     : params.app,
            creation_timestamp      : new Date(),                    
            address                 : params.withdrawAddress,                         // Deposit Address 
            currency                : params.currency._id,
            amount                  : params.amount,
            nonce                   : params.nonce,
        })

        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        try{
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.wallet._id, params.playBalanceDelta);

            /* Add Withdraw to App */
            await AppRepository.prototype.addWithdraw(params.app._id, withdrawSaveObject._id);
            /* Update All Users Balance in Smart-Contract */
            await params.casinoContract.setOwnerWithdrawal({
                newPlayersBalance   : detectCurrencyAmountToSmartContractAmount({amount : params.allUsersBalance, currency : params.currency}),
                amount              : detectCurrencyAmountToSmartContractAmount({amount : params.amount, currency : params.currency})
            });

            return withdrawSaveObject;

        }catch(err){
            console.log(err);
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.wallet._id, -params.playBalanceDelta);
            throwError('ERROR_TRANSACTION')
        }
    },
    __finalizeWithdraw : async (params) => {
        /* Add Withdraw to user */
        await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
            transactionHash         : params.transactionHash,
            last_update_timestamp   : new Date()                        
        })

        return params;
    },
    __getUsersWithdraws : async (params) => {
        let res = await WithdrawRepository.prototype.getAppFiltered(params);
        return res;
    }
}

/**
 * Main App logic.
 *
 * @class
 * @memberof logic
 * @see Parent: {@link logic}
 * @requires lodash
 * @requires helpers/sort_by
 * @requires helpers/bignum
 * @requires logic/block_reward
 * @param {Database} db
 * @param {ZSchema} schema
 * @param {Object} logger
 * @param {function} cb - Callback function
 * @property {App_model} model
 * @property {App_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AppLogic extends LogicComponent{
	constructor(scope) {
		super(scope);
		self = this;
		__private = {
			//ADD
			db : scope.db,
			__normalizedSelf : null
		};

		library = {
			process  : processActions,
			progress : progressActions
		}
    }


    /**
	 * Validates App schema.
	 *
	 * @param {App} App
	 * @returns {App} App
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
                case 'RequestWithdraw' : {
					return await library.process.__requestWithdraw(params); 
                };
                case 'FinalizeWithdraw' : {
					return await library.process.__finalizeWithdraw(params); 
                };
                case 'GetUsersWithdraws' : {
					return await library.process.__getUsersWithdraws(params); 
                }
            }
		}catch(error){
			throw error
		}
	}

	 /**
	 * Tests App schema.
	 *
	 * @param {App} App
	 * @returns {App} App
	 * @throws {string} On schema.validate failure
	 */

	async testParams(params, action){
		try{
			error.app(params, action);
		}catch(err){
            throw err;
        }
    }

	async progress(params, progressAction){
		try{			
			switch(progressAction) {
                case 'RequestWithdraw' : {
					return await library.progress.__requestWithdraw(params); 
                };
                case 'FinalizeWithdraw' : {
					return await library.progress.__finalizeWithdraw(params); 
                };
                case 'GetUsersWithdraws' : {
					return await library.progress.__getUsersWithdraws(params); 
                }
            }
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AppLogic;

