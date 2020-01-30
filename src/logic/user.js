


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import { UsersRepository, AppRepository, WalletsRepository, WithdrawRepository } from '../db/repos';
import Numbers from './services/numbers';
import { Withdraw } from '../models';
import { globals } from '../Globals';
import { throwError } from '../controllers/Errors/ErrorManager';
import { verifytransactionHashWithdrawUser } from './services/services';
import { detectCurrencyAmountToSmartContractAmount } from './utils/currencies';
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
        var user;
        try{
            const { currency, address, tokenAmount } = params; 
            if(tokenAmount <= 0){throwError('INVALID_AMOUNT')}
            /* Get User Id */
            user = await UsersRepository.prototype.findUserById(params.user);
            var app = await AppRepository.prototype.findAppById(params.app);
            /* Get app and User */
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            /* Get User and App Wallets */
            const userWallet = user.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!userWallet || !userWallet.currency){throwError('CURRENCY_NOT_EXISTENT')};
            let amount = parseFloat(Math.abs(tokenAmount));

            /* User Current Balance */
            let currentBalance = parseFloat(userWallet.playBalance);
            
            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            let res = {
                // max_withdraw: (!userWallet.max_withdraw) ? 0 : userWallet.max_withdraw,
                hasEnoughBalance,
                user_in_app,
                currency      : userWallet.currency,
                withdrawAddress : address,
                userWallet : userWallet,
                amount,
                playBalanceDelta : parseFloat(-Math.abs(amount)),
                user : user,
                app : app,
                nonce : params.nonce,
                isAlreadyWithdrawingAPI : user.isWithdrawing
            }
            return res;
        }catch(err){ 
            throw err;
        }
    },
    __requestAffiliateWithdraw : async (params) => {
        var user;
        try{
            const { currency } = params;
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}
            /* Get User Id */
            user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            /* Get User and App Wallets */
            const userWallet = user.affiliate.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!userWallet || !userWallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            let amount = parseFloat(Math.abs(params.tokenAmount));
            /* User Current Balance */
            let currentBalance = parseFloat(userWallet.playBalance);
            
            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            let res = {
                hasEnoughBalance,
                user_in_app,
                currency      : userWallet.currency,
                withdrawAddress : params.address,
                userWallet : userWallet,
                amount,
                playBalanceDelta : parseFloat(-Math.abs(amount)),
                user : user,
                app : app,
                nonce : params.nonce,
                isAlreadyWithdrawingAPI : user.isWithdrawing
            }
            return res;
        }catch(err){ 
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {
        try{
            var params_input = params;
            var tokenAmount, wasAddedLogId, withdraw, transaction_params;
            const { currency } = params;

            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            const wallet = user.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};
            const appWallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            let withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
            let withdrawExists = withdraw ? true : false;

            /* Verify User Balance in API */
            let currentAPIBalance = parseFloat(wallet.playBalance);

            /* Get all transactions which match */
            let all_transaction_params = await verifytransactionHashWithdrawUser({
                currency : wallet.currency,
                amount : withdraw.amount,
                transactionHash : params_input.transactionHash,
                platformAddress : appWallet.bank_address
            })

            let transactionIsValid = all_transaction_params.isValid;

            if(transactionIsValid){
                /* Get One of them */
                transaction_params = (await Promise.all(all_transaction_params.transactionTranfer.map( async t => {
                    withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionLogId(t.id);
                    wasAddedLogId = withdraw ? true : false;
                    if(wasAddedLogId) {
                        // Was added 
                        return false;
                    }else{
                        return t;
                    }
                }))).filter(el => el != false)[0];

                if(transaction_params){
                    /* Transaction is Valid */
                    tokenAmount = detectCurrencyAmountToSmartContractAmount({amount : transaction_params.tokenAmount, currency : appWallet.currency});
                }else{
                    transaction_params = {};
                    tokenAmount = undefined;
                }
            }else{
                /* Transaction is Not Valid */
                tokenAmount = undefined;
            }

            
            withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionLogId(transaction_params.id);
            wasAddedLogId = withdraw ? true : false;
            
            /* Verify if was Already Added or Invalid */
            let wasAlreadyAdded = wasAddedLogId

            let res = {
                user_in_app,
                withdrawExists,
                withdraw_id : params.withdraw_id,
                transactionIsValid,
                currentAPIBalance,
                wasAlreadyAdded,
                userWallet : wallet,
                logId : transaction_params.id,
                transactionHash : params.transactionHash,
                currency      : wallet.currency,
                app,
                user,
                amount : parseFloat(-Math.abs(tokenAmount)),
                withdrawAddress : user.address
            }
            
            return res;
        }catch(err){
            throw err;
        }
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
            user                    : params.user._id,
            creation_timestamp      : new Date(),                    
            address                 : params.withdrawAddress,                         // Deposit Address 
            currency                : params.currency,
            amount                  : params.amount,
            nonce                   : params.nonce,
        })
    
        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();
        
        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.userWallet._id, params.playBalanceDelta);
        
        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);
        
        return params;
        
    },
    __requestAffiliateWithdraw :  async (params) => {
        /* Add Withdraw to user */
        var withdraw = new Withdraw({
           user                    : params.user._id,
           app                     : params.app,
           creation_timestamp      : new Date(),                    
           address                 : params.withdrawAddress,                         // Deposit Address 
           currency                : params.currency,
           amount                  : params.amount,
           nonce                   : params.nonce,
           isAffiliate             : true
       })
   
       /* Save Deposit Data */
       var withdrawSaveObject = await withdraw.createWithdraw();

        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.userWallet._id, params.playBalanceDelta);
        
        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);
        return params;
    },
    __finalizeWithdraw : async (params) => {
        try{
            /* Add Withdraw to user */
            await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
                transactionHash         : params.transactionHash,
                logId                   : params.logId,
                last_update_timestamp   : new Date()                           
            });
            return params;
        }catch(err){
            throw err;
        }
    }
}

/**
 * Main user logic.
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
 * @property {user_model} model
 * @property {user_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class UserLogic extends LogicComponent {
	constructor(scope) {
		super(scope);
		self = this;
		__private = {
			//ADD
			db : scope.db,
			__normalizedSelf : null
		};

		library = {
			process : processActions,
			progress : progressActions
		}
    }


    /**
	 * Validates user schema.
	 *
	 * @param {user} user
	 * @returns {user} user
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
                case 'RequestWithdraw' : {
					return await library.process.__requestWithdraw(params); 
                };
                case 'RequestAffiliateWithdraw' : {
                    return await library.process.__requestAffiliateWithdraw(params); 
                }
                case 'FinalizeWithdraw' : {
					return await library.process.__finalizeWithdraw(params); 
                };
			}
		}catch(err){
			throw err;
		}
	}

	 /**
	 * Tests user schema.
	 *
	 * @param {user} user
	 * @returns {user} user
	 * @throws {string} On schema.validate failure
	 */

	async testParams(params, action){
		try{
			error.user(params, action);
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
                case 'RequestAffiliateWithdraw' : {
                    return await library.progress.__requestAffiliateWithdraw(params); 
                }
                case 'FinalizeWithdraw' : {
					return await library.progress.__finalizeWithdraw(params); 
                };
			}
		}catch(err){
			throw err;
		}
	}
}

// Export Default Module
export default UserLogic;