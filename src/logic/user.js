


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';

import { UsersRepository, AppRepository, WalletsRepository, WithdrawRepository, AddOnRepository, AutoWithdrawRepository } from '../db/repos';
import Numbers from './services/numbers';
import { Withdraw } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import BitGoSingleton from './third-parties/bitgo';
import { Security } from '../controllers/Security';
import Mailer from './services/mailer';
import { setLinkUrl } from '../helpers/linkUrl';
import { User } from "../models";
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
        var user, isAutomaticWithdraw, addOnObject, isAutomaticWithdrawObject;
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

            const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            let amount = parseFloat(Math.abs(tokenAmount));

            /* User Current Balance */
            let currentBalance = parseFloat(userWallet.playBalance);

            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify If Exists AutoWithdraw */
            if (app.addOn){
                addOnObject = await AddOnRepository.prototype.findById(app.addOn);
                if (addOnObject.autoWithdraw){
                    isAutomaticWithdrawObject = await AutoWithdrawRepository.prototype.findById(addOnObject.autoWithdraw);
                    isAutomaticWithdraw = isAutomaticWithdrawObject.isAutoWithdraw
                    isAutomaticWithdraw = {verify : isAutomaticWithdraw, textError : isAutomaticWithdraw ? "success" : "Automatic withdrawal set to false" };
                } else {
                    isAutomaticWithdraw = {verify : false, textError : "AutoWithdraw as Undefined"};
                }
            } else {
                isAutomaticWithdraw = {verify : false, textError : "AddOn as Undefined"};
            }

            /* Verify if Email is Confirmed */
            if(isAutomaticWithdraw.verify){
                isAutomaticWithdraw = {verify : user.email_confirmed, textError : user.email_confirmed ? "success" : "Email Not Verified" };
            }

            /* Verify if Max Withdraw Amount Cumulative was reached */
            if(isAutomaticWithdraw.verify){
                let withdrawPerCurrency = user.withdraws.filter(c => c.currency.toString() == params.currency.toString())
                let withdrawAcumulative = withdrawPerCurrency.reduce(
                    (acumulative , withdrawValue) => acumulative + withdrawValue.amount
                    , 0 
                );
                withdrawAcumulative = parseFloat(params.tokenAmount + withdrawAcumulative).toFixed(6);
                let maxWithdrawAmountCumulativePerCurrency = isAutomaticWithdrawObject.maxWithdrawAmountCumulative.find(c => c.currency.toString() == params.currency.toString())
                if(withdrawAcumulative <= maxWithdrawAmountCumulativePerCurrency.amount){
                    isAutomaticWithdraw = {verify : true, textError : "success"};
                } else {
                    isAutomaticWithdraw = {verify : false, textError : "Amount accumulated withdrawal greater than the maximum allowed"};
                }
            }

            /* Verify if Max Withdraw Per Transaction was reached */
            if(isAutomaticWithdraw.verify){
                let maxWithdrawAmountPerTransactionPerCurrency = isAutomaticWithdrawObject.maxWithdrawAmountPerTransaction.find(c => c.currency.toString() == params.currency.toString())
                if(params.tokenAmount <= maxWithdrawAmountPerTransactionPerCurrency.amount){
                    isAutomaticWithdraw = {verify : true, textError : "success"};
                } else {
                    isAutomaticWithdraw = {verify : false, textError : "Amount withdrawal greater than the maximum allowed"};
                }
            }
            
            /* Verify if Withdraw position is already opened in the Smart-Contract */
            var res = {
                withdrawNotification: isAutomaticWithdraw.textError,
                max_withdraw: (!wallet.max_withdraw) ? 0 : wallet.max_withdraw,
                min_withdraw: (!wallet.min_withdraw) ? 0 : wallet.min_withdraw,
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
                isAlreadyWithdrawingAPI : user.isWithdrawing,
                emailConfirmed : (user.email_confirmed != undefined && user.email_confirmed === true ),
                isAutomaticWithdraw
            }
            return res;
        } catch(err) {
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
            if(!user){throwError('USER_NOT_EXISTENT')};
            
            /* Get User and App Wallets */
            const userWallet = user.affiliate.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!userWallet || !userWallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};
            console.log("WALLET:: ", wallet)
            
            /* Get Amount of Withdraw */
            let amount = parseFloat(Math.abs(params.tokenAmount));
            
            /* User Current Balance */
            let currentBalance = parseFloat(userWallet.playBalance);
            
            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            let res = {
                affiliate_min_withdraw: (!wallet.affiliate_min_withdraw) ? 0 : wallet.affiliate_min_withdraw,
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
            console.log("res:: ", res)
            return res;
        }catch(err){ 
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {
        try{
            const { currency } = params;

            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            const wallet = user.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            const appWallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            let withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
            let withdrawExists = withdraw ? true : false;
            let wasAlreadyAdded = withdraw ? withdraw.done : false;

            /* Verify User Balance in API */
            let currentAPIBalance = parseFloat(wallet.playBalance);

            let transactionIsValid = true;

            let res = {
                user_in_app,
                appWallet,
                withdrawExists,
                withdraw_id : params.withdraw_id,
                transactionIsValid,
                currentAPIBalance,
                wasAlreadyAdded,
                userWallet : wallet,
                transactionHash : params.transactionHash,
                currency      : wallet.currency,
                app,
                user,
                amount : parseFloat(Math.abs(withdraw.amount)),
                withdrawAddress : withdraw.address
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
            withdrawNotification    : params.withdrawNotification
        })
        
        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.userWallet._id, params.playBalanceDelta);
        
        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);
        var app_id = params.app._id
        var user_id = params.user._id
        var withdraw_obj_id = withdrawSaveObject._id
        var currency_id = params.currency._id
        if (params.isAutomaticWithdraw.verify){
            let params = {app: app_id, user: user_id, withdraw_id: withdraw_obj_id, currency: currency_id}
            let user = new User(params);
            let data = await user.finalizeWithdraw();
        }
        return withdrawSaveObject._id;
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
        return null;
    },
    __finalizeWithdraw : async (params) => {
        try{

            let bitgo_tx = await BitGoSingleton.sendTransaction({
                wallet_id : params.appWallet.bitgo_id, 
                ticker : params.currency.ticker, 
                amount : params.amount, 
                address : params.withdrawAddress,
                passphrase : Security.prototype.decryptData(params.appWallet.hashed_passphrase)

            });
            let link_url = setLinkUrl({ticker : params.currency.ticker, address : bitgo_tx.txid, isTransactionHash : true })
            /* Add Withdraw to user */
            await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
                transactionHash         :   bitgo_tx.txid,
                bitgo_id                :   bitgo_tx.transfer.id,
                last_update_timestamp   :   new Date(),
                link_url                :   link_url                           
            });
            /* Send Email */
            let mail = new Mailer();
            let attributes = {
                TEXT: mail.setTextNotification('WITHDRAW', params.amount, params.currency.ticker)
            };
            mail.sendEmail({app_id : params.app.id, user : params.user, action : 'USER_NOTIFICATION', attributes});
            return {
                tx : bitgo_tx.txid
            };
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