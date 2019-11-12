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
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}

            /* Get App Id */
            app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}

            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                account             : globals.getManagerAccount(),
                contractAddress     : app.platformAddress,
                tokenAddress        : app.platformTokenAddress
            })

            let amount = Numbers.toFloat(Math.abs(params.tokenAmount));
            let currentBalance = Numbers.toFloat(app.wallet.playBalance);

            /* Get All Users Balance */
            let allUsersBalance = (await UsersRepository.prototype.getAllUsersBalance({app : app._id})).balance;
            if(typeof allUsersBalance != 'number'){throwError('UNKNOWN')}
            /* Verify if User new Balance is the same as requested to Update */
            
            /* Verify if App has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= Numbers.toFloat(app.wallet.playBalance));

            let res = {
                allUsersBalance,
                hasEnoughBalance,
                withdrawAddress : app.ownerAddress,
                currencyTicker : app.currencyTicker,
                amount : amount,
                playBalanceDelta : Numbers.toFloat(-Math.abs(amount)),
                casinoContract : casinoContract,
                address     : app.ownerAddress,
                app         : app,
                decimals    : app.decimals,
                nonce       : params.nonce,
            }

            return res;
        }catch(err){
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {

        var params_input = params;
        var transaction_params = { }, tokenDifferenceDecentralized;

        /* Get App By Id */
        let app = await AppRepository.prototype.findAppById(params.app);
        if(!app){throwError('APP_NOT_EXISTENT')}

        /* Create Casino Contract Instance */
        let casinoContract = new CasinoContract({
            web3                : globals.web3,
            contractAddress     : app.platformAddress,
            tokenAddress        : app.platformTokenAddress
        })

        /* Verify if this transactionHashs was already added */
        let withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionHash(params.transactionHash);
        let wasAlreadyAdded = withdraw ? true : false;
        
        withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
        let withdrawExists = withdraw ? true : false;

        /* Verify App Balance in Smart-Contract */
        let currentOpenWithdrawingAmount = await casinoContract.getApprovedWithdrawAmount(
            {address : app.ownerAddress, decimals : app.decimals});

        var hashWithdrawingPositionOpen = (currentOpenWithdrawingAmount != 0 ) ? true : false;
       
        /* Verify App Balance in API */
        let currentAPIBalance = Numbers.toFloat(app.wallet.playBalance);

        /* Withdraw Occured in the Smart-Contract */
        transaction_params = await verifytransactionHashWithdrawApp(
            'eth', params_input.transactionHash, app.platformAddress, app.decimals
        )

        let transactionIsValid = transaction_params.isValid;

        if(transaction_params.isValid){
            /* Transaction is Valid */
            tokenDifferenceDecentralized = Numbers.toFloat(Numbers.fromDecimals(transaction_params.tokenAmount, app.decimals));
        }else{
            tokenDifferenceDecentralized = undefined
        }

        /* Verify if Ap Address is Valid */
        let isValidAddress = (new String(app.ownerAddress).toLowerCase() == new String(transaction_params.tokensTransferedTo).toLowerCase())
        
        let res = {
            withdrawExists,
            withdraw_id : params.withdraw_id,
            transactionIsValid,
            hashWithdrawingPositionOpen,
            isValidAddress,
            currentAPIBalance,
            casinoContract      : casinoContract,
            wasAlreadyAdded,
            transactionHash     : params.transactionHash,
            currencyTicker      : app.currencyTicker,
            creationDate        : new Date(),
            app,
            amount              : -Math.abs(Numbers.toFloat(tokenDifferenceDecentralized)),
            withdrawAddress     : transaction_params.tokensTransferedTo
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
            currency                : params.currencyTicker,
            amount                  : params.amount,
            nonce                   : params.nonce,
        })

        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        try{
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.app.wallet, params.playBalanceDelta);

            /* Add Withdraw to App */
            await AppRepository.prototype.addWithdraw(params.app._id, withdrawSaveObject._id);
            /* Update All Users Balance in Smart-Contract */
            await params.casinoContract.approveOwnerWithdrawal({
                address             : params.withdrawAddress,
                amount              : Numbers.toFloat(params.amount),
                newPlayersBalance   : Numbers.toFloat(params.allUsersBalance),
                decimals            : params.decimals
            });

            return withdrawSaveObject;

        }catch(err){
            console.log(err);
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.app.wallet, -params.playBalanceDelta);
            throwError('ERROR_TRANSACTION')
        }
    },
    __finalizeWithdraw : async (params) => {
        /* Add Withdraw to user */
        await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
            transactionHash         : params.transactionHash,
            last_update_timestamp   : new Date(),                             
            amount                  : Numbers.toFloat(Math.abs(params.amount))
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

