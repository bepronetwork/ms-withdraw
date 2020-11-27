


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';

import { UsersRepository, AppRepository, WalletsRepository, WithdrawRepository, AddOnRepository, AutoWithdrawRepository, CurrencyRepository } from '../db/repos';
import Numbers from './services/numbers';
import { Withdraw } from '../models';
import { cryptoEth, cryptoBtc } from './third-parties/cryptoFactory';
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

            /* Just Make Request If haven't Bonus Amount on Wallet */
            let bonusAmount = userWallet.bonusAmount
            let whatsLeftBetAmountForBonus = userWallet.minBetAmountForBonusUnlocked - userWallet.incrementBetAmountForBonus
            let currencyObject = await CurrencyRepository.prototype.findById(currency);
            if(bonusAmount > 0){throwError('HAS_BONUS_YET', `, ${whatsLeftBetAmountForBonus} ${currencyObject.ticker} left before there can be a withdrawal`)}

            const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            let amount = parseFloat(Math.abs(tokenAmount));

            if(app.integrations.kyc.isActive) {
                if(!app.virtual && user.kyc_needed){throwError('KYC_NEEDED')}
            } else {
                throwError('KYC_NEEDED')
            }

            /* Verifying AddOn and set Fee */
            let addOn = app.addOn;
            let fee = 0;
            if(addOn && addOn.txFee && addOn.txFee.isTxFee){
                fee = addOn.txFee.withdraw_fee.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
            }

            /* Verify if amount less than fee */
            if(amount <= fee){throwError('WITHDRAW_FEE')}

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
                isAutomaticWithdraw,
                fee,
                app_wallet : wallet
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
            if(app.integrations.kyc.isActive) {
                if(!app.virtual && user.kyc_needed){throwError('KYC_NEEDED')}
            } else {
                throwError('KYC_NEEDED')
            }
            
            /* Get User and App Wallets */
            const userWallet = user.affiliate.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!userWallet || !userWallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            const wallet = app.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};
            
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
            if(app.integrations.kyc.isActive) {
                if(!app.virtual && (user.kyc_needed || user.kyc_status != "verified")){throwError('KYC_NEEDED')}
            } else {
                throwError('KYC_NEEDED')
            }
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
    },
    __cancelWithdraw : async (params) => {
        try{
            const { currency } = params;

            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            const wallet = user.wallet.find( w => new String(w.currency._id).toString() == new String(currency).toString());
            if(!wallet || !wallet.currency){throwError('CURRENCY_NOT_EXISTENT')};

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            let withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
            let withdrawExists = withdraw ? true : false;
            let wasAlreadyAdded = withdraw ? withdraw.done : false;

            // let transactionIsValid = true;

            let res = {
                wallet_id: wallet._id,
                amount: withdraw.amount,
                note: params.note,
                user_in_app,
                withdrawExists,
                withdraw_id : params.withdraw_id,
                wasAlreadyAdded,
                app,
                user
            }
            return res;
        }catch(err){
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        var { currency, id, app } = params;
        /* Get User Id */
        let user = await UsersRepository.prototype.findUserById(id);
        app = await AppRepository.prototype.findAppById(app, "simple");
        if (!app) { throwError('APP_NOT_EXISTENT') }
        if (!user) { throwError('USER_NOT_EXISTENT') }
        if (!user.email_confirmed) { throwError('UNCONFIRMED_EMAIL') }
        var app_wallet = app.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
        var user_wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
        var erc20 = false;
        if(user_wallet.currency.erc20){
            // Is ERC20 Token simulate use of eth wallet
            user_wallet = user.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String('eth').toLowerCase());
            app_wallet  = app.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String('eth').toString());
            erc20 = true
        }

        return {
            app_wallet,
            user,
            app,
            user_wallet,
            erc20,
            currency
        };

    },
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
        let { amount, app_wallet, fee, playBalanceDelta } = params;

        /* Subtracting fee from amount */
        amount = amount - fee;

         /* Add Withdraw to user */
         var withdraw = new Withdraw({
            app                     : params.app,
            user                    : params.user._id,
            creation_timestamp      : new Date(),
            address                 : params.withdrawAddress,                         // Deposit Address 
            currency                : params.currency,
            amount                  : amount,
            nonce                   : params.nonce,
            withdrawNotification    : params.withdrawNotification,
            fee                     : fee
        })
        
        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.userWallet._id, playBalanceDelta);

        /* Update App Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(app_wallet._id, fee);
        
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
    },
    __cancelWithdraw : async (params) => {
        try {
            /* Add Cancel Withdraw to user */
            await WithdrawRepository.prototype.cancelWithdraw(params.withdraw_id, {
                last_update_timestamp   :   new Date(),
                note: params.note
            });
            await WalletsRepository.prototype.updatePlayBalance(params.wallet_id, params.amount);
            return true;
        } catch(err) {
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        const { app_wallet, user_wallet, user, app, erc20, currency } = params;
        try {
            let walletToAddress2 = await BitGoSingleton.getWallet({ ticker: app_wallet.currency.ticker, id: app_wallet.bitgo_id });
            let bitgo_address2;
            if(!app_wallet.bitgo_id_not_webhook) {
                bitgo_address2 = await BitGoSingleton.generateDepositAddress({ wallet : walletToAddress2, label: `${app._id}-${app_wallet.currency.ticker}-second_wallet`});
                await WalletsRepository.prototype.updateBitgoIdNotWebhook(app_wallet._id, bitgo_address2.id);
                throwError('WALLET_WAIT');
            }
            if(!app_wallet.bank_address_not_webhook) {
                bitgo_address2 = await BitGoSingleton.generateDepositAddress({ wallet : walletToAddress2, label: `${app._id}-${app_wallet.currency.ticker}-second_wallet`, id: app_wallet.bitgo_id_not_webhook});
                if(!bitgo_address2.address) throwError('WALLET_WAIT');
                await WalletsRepository.prototype.updateAddress2(app_wallet._id, bitgo_address2.address)
                throwError('WALLET_WAIT');
            }

            let addresses = user_wallet.depositAddresses;
            let address = addresses.find( a => a.address);
            if(!address){


                // let bitgo_address = await BitGoSingleton.generateDepositAddress({ wallet, label: user._id, id: bitgo_id });
                var crypto_address = null;
                switch ((app_wallet.currency.ticker).toLowerCase()) {
                    case 'btc': {
                        crypto_address = await cryptoBtc.CryptoBtcSingleton.generateDepositAddress();
                        /* Import address to HD Wallet */
                        await cryptoBtc.CryptoBtcSingleton.importAddressAsWallet({
                            walletName  : `${user._id}-${user_wallet.currency.ticker}`, 
                            address     : crypto_address.payload.address,
                            password    : Security.prototype.decryptData(app_wallet.hashed_passphrase),
                            privateKey  : crypto_address.payload.privateKey
                        });
                        /* Record webhooks */
                        await cryptoBtc.CryptoBtcSingleton.addAppDepositWebhook({
                            address     : crypto_address.payload.address,
                            app_id      : user._id,
                            currency_id : user_wallet.currency._id,
                            isApp       : false
                        });
                        /* Record Payment Forwarding webhooks */
                        let resCreatePaymentForwarding = await cryptoBtc.CryptoBtcSingleton.createPaymentForwarding({
                            from: crypto_address.payload.address,
                            to: app_wallet.bank_address_not_webhook,
                            callbackURL: `${MS_MASTER_URL}/api/user/paymentForwarding?id=${user._id}&currency=${user_wallet.currency._id}&isApp=${false}`,
                            wallet: `${user._id}-${user_wallet.currency.ticker}`,
                            password: Security.prototype.decryptData(app_wallet.hashed_passphrase),
                            confirmations: 3
                        });
                        if(resCreatePaymentForwarding===false) {throwError('WALLET_WAIT');}
                        break;
                    };
                    case 'eth': {
                        crypto_address = await cryptoEth.CryptoEthSingleton.generateDepositAddress();
                        /* Record webhooks */
                        await cryptoEth.CryptoEthSingleton.addAppDepositWebhook({
                            address     : crypto_address.payload.address,
                            app_id      : user._id,
                            currency_id : user_wallet.currency._id,
                            isApp       : false
                        });
                        /* Record Payment Forwarding webhooks */
                        let resCreatePaymentForwarding = await cryptoEth.CryptoEthSingleton.createPaymentForwarding({
                            from: crypto_address.payload.address,
                            to: app_wallet.bank_address_not_webhook,
                            callbackURL: `${MS_MASTER_URL}/api/user/paymentForwarding?id=${user._id}&currency=${user_wallet.currency._id}&isApp=${false}`,
                            wallet: crypto_address.payload.address,
                            privateKey: crypto_address.payload.privateKey,
                            confirmations: 3
                        });
                        if(resCreatePaymentForwarding===false) {throwError('WALLET_WAIT');}
                        break;
                    };
                }

                address = {
                    address: crypto_address.payload.address,
                    hashed_private_key: Security.prototype.encryptData(crypto_address.payload.privateKey),
                    wif: !crypto_address.payload.wif ? '' : crypto_address.payload.wif
                };
                // Bitgo has created the address
                let addressObject = (await (new Address({ currency: user_wallet.currency._id, user: user._id, address: address.address, wif_btc: address.wif, hashed_private_key : address.hashed_private_key})).register())._doc;
                // Add Deposit Address to User Deposit Addresses
                await WalletsRepository.prototype.addDepositAddress(user_wallet._id, addressObject._id);
            }else if(erc20){
                var walletUserErc20 = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());

                if(!(walletUserErc20.depositAddresses.find( a => a.address))){

                    let addressObject = (await (new Address({ currency: walletUserErc20.currency._id, user: user._id, address: address.address, wif_btc: address.wif, hashed_private_key : address.hashed_private_key})).register())._doc;

                    /* Record ERC-20 webhooks */
                    await cryptoEth.CryptoEthSingleton.addAppDepositERC20Webhook({
                        address     : address.address,
                        app_id      : user._id,
                        currency_id : walletUserErc20.currency._id,
                        isApp       : false
                    });
                    /* Record Payment Forwarding webhooks */
                    let resCreatePaymentForwarding = await cryptoEth.CryptoEthSingleton.createPaymentForwardingToken({
                        from: address.address,
                        to: app_wallet.bank_address_not_webhook,
                        callbackURL: `${MS_MASTER_URL}/api/user/paymentForwarding?id=${user._id}&currency=${walletUserErc20.currency._id}&isApp=${false}`,
                        wallet: address.address,
                        privateKey: Security.prototype.decryptData(address.hashed_private_key),
                        confirmations: 3,
                        token: walletUserErc20.currency.address
                    });
                    if(resCreatePaymentForwarding===false) {throwError('WALLET_WAIT');}

                    await WalletsRepository.prototype.addDepositAddress(walletUserErc20._id, addressObject._id);
                }
            }

            if (address.address) {
                //Address Existent
                return {
                    address: address.address,
                    currency: user_wallet.currency.ticker
                }
            } else {
                // Not existent
                return {
                    message: 'Waiting for address initialization'
                }
            }
        } catch(err) {
            throw err;
        }

    },
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
                }
                case 'CancelWithdraw' : {
                    return await library.process.__cancelWithdraw(params);
                };
                case 'GetDepositAddress': {
                    return await library.process.__getDepositAddress(params);
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
                }
                case 'CancelWithdraw' : {
					return await library.progress.__cancelWithdraw(params);
                };
                case 'GetDepositAddress': {
                    return await library.progress.__getDepositAddress(params);
                };
			}
		}catch(err){
			throw err;
		}
	}
}

// Export Default Module
export default UserLogic;