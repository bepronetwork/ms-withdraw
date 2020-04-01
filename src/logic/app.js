import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository, WithdrawRepository, MailSenderRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { Withdraw } from '../models';
import CasinoContract from './eth/CasinoContract';
import { globals } from '../Globals';
import Numbers from './services/numbers';
import { throwError } from '../controllers/Errors/ErrorManager';
import { verifytransactionHashWithdrawApp } from './services/services';
import {  detectCurrencyAmountToSmartContractAmount } from './utils/currencies';
import BitGoSingleton from './third-parties/bitgo';
import { Security } from '../controllers/Security';
import { SendInBlueAttributes } from './third-parties';
import { SendinBlueSingleton, SendInBlue } from './third-parties/sendInBlue';
import { setLinkUrl } from '../helpers/linkUrl';
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

            let amount = parseFloat(Math.abs(params.tokenAmount));
            let appBalance = parseFloat(wallet.playBalance);

            /* Get list ownerAddress */
            let listAddress = app.authorizedListAddress.find(w => new String(w.currency).toString() == new String(currency).toString());
            listAddress = (!listAddress) ? [] : listAddress.ownerAddress;
            /* Get All Users Balance */
            let allUsersBalance = (await UsersRepository.prototype.getAllUsersBalance({app : app._id, currency : wallet.currency._id})).balance;
            if(typeof allUsersBalance != 'number'){throwError('UNKNOWN')}
            /* Verify if App has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= appBalance);

            let res = {
                max_withdraw: (!wallet.max_withdraw) ? 0 : wallet.max_withdraw,
                listAddress,
                allUsersBalance,
                appBalance,
                hasEnoughBalance,
                wallet : wallet,
                currency : wallet.currency,
                withdrawAddress : address,
                amount : amount,
                playBalanceDelta : parseFloat(-Math.abs(amount)),
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
        
        let withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
        let withdrawExists = withdraw ? true : false;
        let wasAlreadyAdded = withdraw ? withdraw.done : false;

        /* Verify App Balance in API */
        let currentAPIBalance = parseFloat(wallet.playBalance);
    
        /* Verify if Ap Address is Valid */
        let isValidAddress = true;

        let res = {
            withdrawExists,
            withdraw_id : params.withdraw_id,
            isValidAddress,
            amount : withdraw.amount,
            currentAPIBalance,
            wallet : wallet,
            wasAlreadyAdded,
            transactionHash     : params.transactionHash,
            currency            : wallet.currency,
            creationDate        : new Date(),
            app,
            withdrawAddress     : withdraw.address
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

        /* Update App Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.wallet._id, params.playBalanceDelta);

        /* Add Withdraw to App */
        await AppRepository.prototype.addWithdraw(params.app._id, withdrawSaveObject._id);

        return withdrawSaveObject;
        
    },
    __finalizeWithdraw : async (params) => {

        let bitgo_tx = await BitGoSingleton.sendTransaction({
            wallet_id : params.wallet.bitgo_id, 
            ticker : params.currency.ticker, 
            amount : params.amount, 
            address : params.withdrawAddress, 
            passphrase : Security.prototype.decryptData(params.wallet.hashed_passphrase)
        });
        
        let link_url = setLinkUrl({ticker : params.currency.ticker, address : bitgo_tx.txid, isTransactionHash : true })

        /* Add Withdraw to user */
        let text = await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
            transactionHash         :   bitgo_tx.txid,
            bitgo_id                :   bitgo_tx.transfer.id,
            last_update_timestamp   :   new Date(),
            link_url                :   link_url                      
        })

        return {
            tx : bitgo_tx.txid
        };
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

