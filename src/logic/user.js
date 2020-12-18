


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import Numbers from './services/numbers';
import { Deposit, Withdraw, Address } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import Mailer from './services/mailer';
import { setLinkUrl } from '../helpers/linkUrl';
import { PusherSingleton, TrustologySingleton } from './third-parties';
import { getVirtualAmountFromRealCurrency } from '../helpers/virtualWallet';
import { WithdrawRepository } from '../db/repos';
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

    __finalizeWithdraw: async (params) => {
        try {
            return params;
        } catch (err) {
            throw err;
        }
    },
    __updateWallet: async (params) => {
        try {
            // data: {amount,tx,subWalletIdString,transactionType,symbol}
            var {data} = params;
            let currencyData   = await CurrencyRepository.prototype.findByTicker( params.isToken ? String(data.symbol).toUpperCase() : String(params.type).toUpperCase());
            let walletReal = await WalletsRepository.prototype.findWalletBySubWalletIdAndCurrency(data.subWalletIdString, currencyData._id);
            let userTemp   = await UsersRepository.prototype.findByWallet(walletReal._id);
            /* Get User Info */
            let user = await UsersRepository.prototype.findUserById(userTemp._id);
            if (!user) { throwError('USER_NOT_EXISTENT') }
            let currency = String(walletReal.currency).toString();
            const wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
            if (!wallet || !wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };

            /* Get App Info */
            var app = await AppRepository.prototype.findAppById(user.app_id._id, "simple");
            if (!app) { throwError('APP_NOT_EXISTENT') }
            var amount = data.amount;
            const app_wallet = app.wallet.find(w => new String(w.currency._id).toLowerCase() == new String(currency).toLowerCase());
            currency = app_wallet.currency._id;
            if (!app_wallet || !app_wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };
            let addOn = app.addOn;
            let fee = 0;
            if (addOn && addOn.txFee && addOn.txFee.isTxFee) {
                fee = addOn.txFee.deposit_fee.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
            }

            var isPurchase = false, virtualWallet = null, appVirtualWallet = null;

            /* Verify if this transactionHashs was already added */
            let deposit = await DepositRepository.prototype.getDepositByTransactionHash(data.tx);
            let wasAlreadyAdded = deposit ? true : false;

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x.toString() == user._id.toString())) > -1);

            let depositBonusValue = 0;
            let minBetAmountForBonusUnlocked = 0;
            let hasBonus = false;

            /* Verify it is a virtual casino purchase */
            if (app.virtual == true) {
                isPurchase = true;
                virtualWallet = user.wallet.find(w => w.currency.virtual == true);
                appVirtualWallet = app.wallet.find(w => w.currency.virtual == true);
                if (!virtualWallet || !virtualWallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };
            } else { /* Verify it not is a virtual casino purchase */
                /* Verify AddOn Deposit Bonus */
                if (addOn && addOn.depositBonus && (addOn.depositBonus.isDepositBonus.find(w => new String(w.currency).toString() == new String(currency).toString())).value) {
                    hasBonus = dataIsDeposit.value;
                    let min_deposit = addOn.depositBonus.min_deposit.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
                    let percentage = addOn.depositBonus.percentage.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
                    let max_deposit = addOn.depositBonus.max_deposit.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
                    let multiplierNeeded = addOn.depositBonus.multiplier.find(c => new String(c.currency).toString() == new String(currency).toString()).multiple;
                    if (amount >= min_deposit && amount <= max_deposit) {
                        depositBonusValue = (amount * (percentage / 100));
                        minBetAmountForBonusUnlocked = (depositBonusValue * multiplierNeeded);
                    }
                }
            }

            let res = {
                maxDeposit: (app_wallet.max_deposit == undefined) ? 1 : app_wallet.max_deposit,
                app,
                app_wallet,
                user_in_app,
                isPurchase,
                virtualWallet,
                appVirtualWallet,
                user: user,
                wasAlreadyAdded,
                user_id: user._id,
                wallet: wallet,
                creationDate: new Date(),
                transactionHash: data.tx,
                currencyTicker: wallet.currency.ticker,
                amount,
                fee,
                depositBonusValue,
                hasBonus,
                minBetAmountForBonusUnlocked
            }

            return res;
        } catch (err) {
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        var { currency, id, app } = params;
        /* Get User Id */
        const user = await UsersRepository.prototype.findUserById(id);
        app = await AppRepository.prototype.findAppById(app, "simple");
        if (!app) { throwError('APP_NOT_EXISTENT') }
        if (!user) { throwError('USER_NOT_EXISTENT') }
        if (!user.email_confirmed) { throwError('UNCONFIRMED_EMAIL') }
        var app_wallet = app.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
        var user_wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
        if (user_wallet.depositAddresses != null && user_wallet.depositAddresses.length > 0) {
            return {
                user,
                address: user_wallet.depositAddresses[0].address,
                currency: String(currency).toString()
            }
        }
        var erc20 = false;
        if (user_wallet.currency.erc20) {
            // Is ERC20 Token simulate use of eth wallet
            user_wallet = user.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String('eth').toLowerCase());
            app_wallet = app.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String('eth').toString());
            erc20 = true
            if (user_wallet.depositAddresses == null || user_wallet.depositAddresses.length == 0) {
                throwError('ADD_ETH');
            }
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
    __getTransactions: async (params) => {
        let { user, size, app, offset } = params;

        const deposits = await DepositRepository.prototype.getAll({
            user,
            app,
            size,
            offset 
        });
        const withdraws = await WithdrawRepository.prototype.getAll({
            user: user,
            app,
            size,
            offset 
        });
        return {
            deposits: deposits,
            withdraws: withdraws,
            app,
            user,
            size,
            offset
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
    __finalizeWithdraw: async (params) => {
        let { sendTo, isAutoWithdraw, ticker, isAffiliate, currency, app, user, amount, nonce, withdrawNotification, fee } = params;
        let transaction = null;
        let tx = null;
        let autoWithdraw = null;
        let trustTicker = (ticker.toUpperCase()) == "BTC" ? "BTC" : "ETH";
        
        if (isAutoWithdraw) {
            transaction = await TrustologySingleton.method(trustTicker).autoSendTransaction(
                sendTo,
                (parseFloat(amount) * (Math.pow(10, ((trustTicker == "BTC") ? 8 : 18)))).toString(),
                ((trustTicker == "BTC") ? null : ticker.toUpperCase()),
            );
            tx = (await TrustologySingleton.method(trustTicker).getTransaction(transaction)).data.getRequest.transactionHash;
            autoWithdraw = true;
        } else {
            transaction = await TrustologySingleton.method(trustTicker).sendTransaction(
                sendTo,
                (parseFloat(amount) * (Math.pow(10, ((trustTicker == "BTC") ? 8 : 18)))).toString(),
                ((trustTicker == "BTC") ? null : ticker.toUpperCase()),
            );
            autoWithdraw = false;
        }
        
        let link_url = setLinkUrl({ ticker: ticker.toUpperCase(), address: tx, isTransactionHash: true })

        /* Add Withdraw to user */
        var withdraw = {
            app,
            user,
            creation_timestamp: new Date(),
            address: sendTo, // Deposit Address
            currency_ticker: ticker,
            amount,
            nonce,
            withdrawNotification,
            fee,
            isAffiliate,
            done: true,
            request_id: transaction,
            transactionHash: tx,
            confirmed: true,
            last_update_timestamp: new Date(),
            link_url: link_url,
            status: tx ? 'Processed' : 'Queue',
        }

        const withdrawSaveObject = await WithdrawRepository.save(withdraw)
        console.log("withdrawSaveObject:: ",withdrawSaveObject);

        return{
            withdraw_id: withdrawSaveObject._id,
            tx: tx,
            autoWithdraw
        };
    },
    __updateWallet: async (params) => {

        try {
            let { virtualWallet, appVirtualWallet, isPurchase, wallet, amount, fee, app_wallet, depositBonusValue, hasBonus, minBetAmountForBonusUnlocked } = params;
            var message;

            /* Condition to set value of deposit amount and fee */
            if(amount <= fee){
                fee = amount;
                amount = 0;
            }else{
                amount = amount - fee;
            }
            const options = {
                purchaseAmount : isPurchase ? getVirtualAmountFromRealCurrency({
                    currency : wallet.currency,
                    currencyAmount : amount,
                    virtualWallet : appVirtualWallet
                }) : amount,
                isPurchase : isPurchase,
            }

            /* Create Deposit Object */
            let deposit = new Deposit({
                user: params.user_id,
                transactionHash: params.transactionHash,
                creation_timestamp: params.creationDate,
                isPurchase : options.isPurchase,
                last_update_timestamp: params.creationDate,
                purchaseAmount : options.purchaseAmount,
                currency: wallet.currency._id,
                amount: amount,
                fee: fee,
                hasBonus: hasBonus,
                bonusAmount: depositBonusValue
            })

            /* Save Deposit Data */
            let depositSaveObject = await deposit.createDeposit();

            if(isPurchase){
                /* User Purchase - Virtual */
                await WalletsRepository.prototype.updatePlayBalance(virtualWallet, options.purchaseAmount);
                message = `Bought ${options.purchaseAmount} ${virtualWallet.currency.ticker} in your account with ${amount} ${wallet.currency.ticker}`
            }else{
                /* Add bonus amount */
                await WalletsRepository.prototype.updatePlayBalanceBonus(wallet._id, depositBonusValue);
                await WalletsRepository.prototype.updateMinBetAmountForBonusUnlocked(wallet._id, minBetAmountForBonusUnlocked);
                /* User Deposit - Real */
                await WalletsRepository.prototype.updatePlayBalance(app_wallet._id, fee);
                await WalletsRepository.prototype.updatePlayBalance(wallet._id, amount);
                message = `Deposited ${amount} ${wallet.currency.ticker} in your account`
            }
            /* Add Deposit to user */
            await UsersRepository.prototype.addDeposit(params.user_id, depositSaveObject._id);
            /* Push Webhook Notification */
            PusherSingleton.trigger({
                channel_name: params.user_id,
                isPrivate: true,
                message,
                eventType: 'DEPOSIT'
            });

            /* Send Email */
            let mail = new Mailer();
            let attributes = {
                TEXT: mail.setTextNotification('DEPOSIT', amount, params.wallet.currency.ticker)
            };

            mail.sendEmail({app_id : params.app.id, user : params.user, action : 'USER_NOTIFICATION', attributes});
            return params;
        } catch (err) {
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        const { app_wallet, user_wallet, user, erc20, currency, address } = params;
        const user_wallet_real = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
        if (address != null) {
            return {
                currency: user_wallet_real.currency.ticker,
                address
            }
        }
        try {
            let newAddress = {};
            if (!erc20) {
                const subWalletId = (
                    await TrustologySingleton
                        .method(
                            String(user_wallet_real.currency.ticker).toUpperCase()
                        )
                        .createSubWallet(
                            app_wallet.subWalletId.split("/")[0],
                            String(user._id).toString()
                        )
                ).data.createSubWallet.subWalletId;
                newAddress = (await TrustologySingleton.method(String(user_wallet_real.currency.ticker).toUpperCase()).getAddress(subWalletId)).data.user.subWallet;
                newAddress["subWalletId"] = newAddress.id;
            } else {
                newAddress = { address: user_wallet.depositAddresses[0].address, subWalletId: user_wallet.subWalletId };
            }
            let addressObject = (await (new Address({ currency: user_wallet_real.currency._id, user: user._id, address: newAddress.address })).register())._doc;
            await WalletsRepository.prototype.addDepositAddress(user_wallet_real._id, addressObject._id);
            await WalletsRepository.prototype.addSubWalletId(user_wallet_real._id, newAddress.subWalletId);
            return {
                address: newAddress.address,
                currency: user_wallet_real.currency.ticker
            }
        } catch (err) {
            throw err;
        }

    },
    __getTransactions: async (params) => {
        let{ withdraws, app, user, size, offset, deposits } = params;
        
        for(let withdraw of withdraws){
            if(!withdraw.transactionHash){
                let ticker = (withdraw.currency.ticker.toUpperCase()) == "BTC" ? "BTC" : "ETH";
                const getTransaction =  (await TrustologySingleton.method(ticker).getTransaction(withdraw.request_id)).data.getRequest;
                const tx = getTransaction.transactionHash
                let status = 'Canceled';
                let note = "The withdrawal was canceled by the administrator, the money has already returned to your account."
                if(withdraw.status.toUpperCase() != 'CANCELED'){
                    status = tx ? 'Processed' : 'Queue';
                    note = (status == 'Processed') ? "Successful withdrawal" : "Withdrawal waiting"
                } 
                if(getTransaction.status == 'USER_CANCELLED' && withdraw.status.toUpperCase() != 'CANCELED'){
                    const app_wallet = app.wallet.find(w => new String(w.currency._id).toString() == new String(withdraw.currency._id).toString());
                    const user_wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(withdraw.currency._id).toString());
                    await WalletsRepository.prototype.updatePlayBalance(app_wallet._id, -(parseFloat(withdraw.fee)));
                    await WalletsRepository.prototype.updatePlayBalance(user_wallet._id, parseFloat(withdraw.amount));
                }
                const link_url = setLinkUrl({ ticker: withdraw.currency.ticker, address: tx, isTransactionHash: true })
                await WithdrawRepository.prototype.findByIdAndUpdateTX({
                    _id: withdraw._id,
                    tx,
                    link_url,
                    status: status,
                    note: note
                });
            }
        }

        const withdraws_updated = await WithdrawRepository.prototype.getAll({
            user: user._id,
            size,
            offset 
        });

        return {
            deposits,
            withdraws : withdraws_updated
        };
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
            db: scope.db,
            __normalizedSelf: null
        };

        library = {
            process: processActions,
            progress: progressActions
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
        try {
            switch (processAction) {
                case 'FinalizeWithdraw': {
                    return await library.process.__finalizeWithdraw(params);
                };
                case 'UpdateWallet': {
                    return await library.process.__updateWallet(params);
                };
                case 'GetDepositAddress': {
                    return await library.process.__getDepositAddress(params);
                };
                case 'GetTransactions': {
                    return await library.process.__getTransactions(params);
                };
            }
        } catch (err) {
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

    async testParams(params, action) {
        try {
            error.user(params, action);
        } catch (err) {
            throw err;
        }
    }


    async progress(params, progressAction) {
        try {
            switch (progressAction) {
                case 'FinalizeWithdraw': {
                    return await library.progress.__finalizeWithdraw(params);
                };
                case 'UpdateWallet': {
                    return await library.progress.__updateWallet(params);
                };
                case 'GetDepositAddress': {
                    return await library.progress.__getDepositAddress(params);
                };
                case 'GetTransactions': {
                    return await library.progress.__getTransactions(params);
                };
            }
        } catch (err) {
            throw err;
        }
    }
}

// Export Default Module
export default UserLogic;