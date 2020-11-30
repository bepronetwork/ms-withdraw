import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository, WithdrawRepository, DepositRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { Withdraw, Deposit } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import BitGoSingleton from './third-parties/bitgo';
import { Security } from '../controllers/Security';
import { setLinkUrl } from '../helpers/linkUrl';
import { IS_DEVELOPMENT } from '../config'
let error = new ErrorManager();



// Private fields
let self; // eslint-disable-line no-unused-vars
let library;

let __private = {};



/**
 * Login logic.
 *
 * @class
 * @memberof logic
 * @param {function} params - Function Params
 **/

  
const processActions = {
    __updateWallet : async (params) => {
        var { currency, id, wBT } = params;
        /* Get App Id */
        var app = await AppRepository.prototype.findAppById(id, "simple");
        if(!app){throwError('APP_NOT_EXISTENT')}
        if(IS_DEVELOPMENT){
            wBT.coin = (wBT.coin).substring(1)
        }
        const wallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(wBT.coin).toLowerCase());
        if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};
        if( new String(`${app._id}-${wallet.currency.ticker}-second_wallet`).toLowerCase().toString() == wBT.label) {throwError('PAYMENT_FORWARDING_TRANSACTION')};

        /* Verify if the transactionHash was created */
        const { state, entries, value : amount, type, txid : transactionHash } = wBT;

        const from = entries[0].address;
        const isValid = ((state == 'confirmed') && (type == 'receive'));

        /* Verify if this transactionHashs was already added */
        let deposit = await DepositRepository.prototype.getDepositByTransactionHash(transactionHash);
        let wasAlreadyAdded = deposit ? true : false;

        return  {
            app                 : app,
            wallet              : wallet,
            creationDate        : new Date(),
            transactionHash     : transactionHash,
            from                : from,
            amount              : amount,
            wasAlreadyAdded,
            isValid
        }
    },
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
            let listAddress = app.whitelistedAddresses.find(w => new String(w.currency).toString() == new String(currency).toString());
            listAddress = (!listAddress) ? [] : listAddress.addresses;
            /* Get All Users Balance */
            let allUsersBalance = (await UsersRepository.prototype.getAllUsersBalance({app : app._id, currency : wallet.currency._id})).balance;
            if(typeof allUsersBalance != 'number'){throwError('UNKNOWN')}
            /* Verify if App has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= appBalance);

            let res = {
                max_withdraw: (!wallet.max_withdraw) ? 0 : wallet.max_withdraw,
                min_withdraw: (!wallet.min_withdraw) ? 0 : wallet.min_withdraw,
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
    __updateWallet : async (params) => {
     

        /* Create Deposit Object */
        let deposit = new Deposit({
            app                     : params.app._id,
            transactionHash         : params.transactionHash,
            creation_timestamp      : params.creationDate,                    
            last_update_timestamp   : params.creationDate,                             
            address                 : params.from,                         
            currency                : params.wallet.currency._id,
            amount                  : params.amount,
        })

        /* Save Deposit Data */
        let depositSaveObject = await deposit.createDeposit();
        
        /* Update Balance of App */
        await WalletsRepository.prototype.updatePlayBalance(params.wallet, params.amount);
        
        /* Add Deposit to App */
        await AppRepository.prototype.addDeposit(params.app._id, depositSaveObject._id)

        return params;
    },
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
                case 'UpdateWallet' : {
					return await library.process.__updateWallet(params); break;
                };
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
                case 'UpdateWallet' : {
					return await library.progress.__updateWallet(params); break;
                };
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

