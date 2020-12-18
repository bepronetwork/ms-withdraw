const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';

import {WalletRepository } from '../db/repos';
import { Deposit, Withdraw, Address } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import Mailer from './services/mailer';
import { setLinkUrl } from '../helpers/linkUrl';
import { PusherSingleton, TrustologySingleton } from './third-parties';
import { getVirtualAmountFromRealCurrency } from '../helpers/virtualWallet';
import { PRIVATE_KEY, TRUSTOLOGY_WALLETID_BTC, TRUSTOLOGY_WALLETID_ETH } from '../config';
import * as crypto from "crypto";
const axios = require('axios');
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

    __requestWithdraw: async (params) => {
        var user, isAutomaticWithdraw, addOnObject, isAutomaticWithdrawObject;
        try {
            const { currency, address, tokenAmount } = params;
            let isAffiliate = false
            if (tokenAmount <= 0) { throwError('INVALID_AMOUNT') }
            /* Get User and App */
            user = await UsersRepository.prototype.findUserById(params.user);
            var app = await AppRepository.prototype.findAppById(params.app);
            if (!app) { throwError('APP_NOT_EXISTENT') }
            if (!user) { throwError('USER_NOT_EXISTENT') }
            /* Get User or Affiliate Wallet */
            const userWallet = !isAffiliate ? user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString()) : user.affiliate.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
            if (!userWallet || !userWallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };
            /* Get App Wallet */
            const wallet = app.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
            if (!wallet || !wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };
            const appAddress = wallet.bank_address;
            const ticker = wallet.currency.ticker;

            /* Just Make Request If haven't Bonus Amount on Wallet */
            let bonusAmount = userWallet.bonusAmount
            let whatsLeftBetAmountForBonus = userWallet.minBetAmountForBonusUnlocked - userWallet.incrementBetAmountForBonus
            let currencyObject = await CurrencyRepository.prototype.findById(currency);
            if (bonusAmount > 0) { throwError('HAS_BONUS_YET', `, ${whatsLeftBetAmountForBonus} ${currencyObject.ticker} left before there can be a withdrawal`) }
            /* Get Amount of Withdraw */
            let amount = parseFloat(Math.abs(tokenAmount));
            /* Just Make Withdraw If KYC verified */
            if (!app.integrations || !app.integrations.kyc || !app.integrations.kyc.isActive) {
                throwError('KYC_NEEDED');
            }
            if (!app.virtual && user.kyc_needed) { throwError('KYC_NEEDED') }

            /* Verifying AddOn and set Fee */
            let addOn = app.addOn;
            let fee = 0;
            if (addOn && addOn.txFee && addOn.txFee.isTxFee) {
                fee = addOn.txFee.withdraw_fee.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
            }

            /* Verify if amount less than fee */
            if (amount <= fee) { throwError('WITHDRAW_FEE') }

            /* User Current Balance */
            let currentBalance = parseFloat(userWallet.playBalance);

            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify If Exists AutoWithdraw */
            if (app.addOn) {
                addOnObject = await AddOnRepository.prototype.findById(app.addOn);
                if (addOnObject.autoWithdraw) {
                    isAutomaticWithdrawObject = await AutoWithdrawRepository.prototype.findById(addOnObject.autoWithdraw);
                    isAutomaticWithdraw = isAutomaticWithdrawObject.isAutoWithdraw
                    isAutomaticWithdraw = { verify: isAutomaticWithdraw, textError: isAutomaticWithdraw ? "success" : "Automatic withdrawal set to false" };
                } else {
                    isAutomaticWithdraw = { verify: false, textError: "AutoWithdraw as Undefined" };
                }
            } else {
                isAutomaticWithdraw = { verify: false, textError: "AddOn as Undefined" };
            }

            /* Verify if Email is Confirmed */
            if (isAutomaticWithdraw.verify) {
                isAutomaticWithdraw = { verify: user.email_confirmed, textError: user.email_confirmed ? "success" : "Email Not Verified" };
            }

            /* Verify if Max Withdraw Amount Cumulative was reached */
            if (isAutomaticWithdraw.verify) {
                let withdrawPerCurrency = user.withdraws.filter(c => c.currency.toString() == params.currency.toString())
                let withdrawAcumulative = withdrawPerCurrency.reduce(
                    (acumulative, withdrawValue) => acumulative + withdrawValue.amount
                    , 0
                );
                withdrawAcumulative = parseFloat(params.tokenAmount + withdrawAcumulative).toFixed(6);
                let maxWithdrawAmountCumulativePerCurrency = isAutomaticWithdrawObject.maxWithdrawAmountCumulative.find(c => c.currency.toString() == params.currency.toString())
                if (withdrawAcumulative <= maxWithdrawAmountCumulativePerCurrency.amount) {
                    isAutomaticWithdraw = { verify: true, textError: "success" };
                } else {
                    isAutomaticWithdraw = { verify: false, textError: "Amount accumulated withdrawal greater than the maximum allowed" };
                }
            }

            /* Verify if Max Withdraw Per Transaction was reached */
            if (isAutomaticWithdraw.verify) {
                let maxWithdrawAmountPerTransactionPerCurrency = isAutomaticWithdrawObject.maxWithdrawAmountPerTransaction.find(c => c.currency.toString() == params.currency.toString())
                if (params.tokenAmount <= maxWithdrawAmountPerTransactionPerCurrency.amount) {
                    isAutomaticWithdraw = { verify: true, textError: "success" };
                } else {
                    isAutomaticWithdraw = { verify: false, textError: "Amount withdrawal greater than the maximum allowed" };
                }
            }
            /* Verify if Min Withdraw is Affiliate or not */
            let min_withdraw = null;
            if(isAffiliate){
                min_withdraw = !wallet.affiliate_min_withdraw ? 0 : wallet.affiliate_min_withdraw;
            } else {
                min_withdraw = !wallet.min_withdraw ? 0 : wallet.min_withdraw;
            } 

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            var res = {
                withdrawNotification: isAutomaticWithdraw.textError,
                max_withdraw: (!wallet.max_withdraw) ? 0 : wallet.max_withdraw,
                min_withdraw,
                hasEnoughBalance,
                user_in_app,
                currency: userWallet.currency,
                withdrawAddress: address,
                userWallet: userWallet,
                amount,
                playBalanceDelta: parseFloat(-Math.abs(amount)),
                user: user,
                app: app,
                nonce: params.nonce,
                isAlreadyWithdrawingAPI: user.isWithdrawing,
                emailConfirmed: (user.email_confirmed != undefined && user.email_confirmed === true),
                isAutomaticWithdraw,
                fee,
                app_wallet: wallet,
                isAffiliate,
                appAddress,
                ticker
            }
            return res;
        } catch (err) {
            throw err;
        }
    },
    __updateWallet: async (params) => {
        try {
            let wallet = await WalletRepository.findWalletBySubWalletId(params.data.subWalletIdString);
            return {...params, id: wallet.user, currency: wallet.currency};
        } catch (err) {
            throw err;
        }
    },
    __cancelWithdraw: async (params) => {
        try {
            const { currency } = params;

            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if (!app) { throwError('APP_NOT_EXISTENT') }
            if (!user) { throwError('USER_NOT_EXISTENT') }
            const wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
            if (!wallet || !wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };

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
                withdraw_id: params.withdraw_id,
                wasAlreadyAdded,
                app,
                user
            }
            return res;
        } catch (err) {
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        var { currency, id, app, ticker, erc20 } = params;
        // if (!user.email_confirmed) { throwError('UNCONFIRMED_EMAIL') }
        const wallet = await WalletRepository.findByUserAndTicker(app, ticker);
        return {
            currency,
            id,
            app,
            ticker,
            erc20,
            wallet
        };

    },
    __getTransactions: async (params) => {
        let { user, size, app, offset } = params;

        app = await AppRepository.prototype.findAppById(app, "simple");
        if (!app) { throwError('APP_NOT_EXISTENT') }
        user = await UsersRepository.prototype.findUserByIdAndApp(user, app._id);
        if (!user) { throwError('USER_NOT_EXISTENT') }
        const deposits = await DepositRepository.prototype.getAll({
            user: user._id,
            size,
            offset 
        });
        const withdraws = await WithdrawRepository.prototype.getAll({
            user: user._id,
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
    __requestWithdraw: async (params) => {
        let { amount, app_wallet, fee, playBalanceDelta, isAffiliate } = params;
        let transaction = null;
        let tx = null;
        /* Subtracting fee from amount */
        amount = amount - fee;

        let ticker = (params.ticker.toUpperCase()) == "BTC" ? "BTC" : "ETH";
        let autoWithdraw = null;
        if (params.isAutomaticWithdraw.verify) {
            transaction = await TrustologySingleton.method(ticker).autoSendTransaction(
                params.withdrawAddress,
                (parseFloat(amount) * (Math.pow(10, ((ticker == "BTC") ? 8 : 18)))).toString(),
                ((ticker == "BTC") ? null : params.ticker.toUpperCase()),
            );
            tx = (await TrustologySingleton.method(ticker).getTransaction(transaction)).data.getRequest.transactionHash;
            autoWithdraw = true;
        } else {
            transaction = await TrustologySingleton.method(ticker).sendTransaction(
                ((ticker == "BTC") ? params.app_wallet.subWalletId : params.appAddress),
                params.withdrawAddress,
                (parseFloat(amount) * (Math.pow(10, ((ticker == "BTC") ? 8 : 18)))).toString(),
                ((ticker == "BTC") ? null : params.ticker.toUpperCase()),
            );
            autoWithdraw = false;
        }
        let link_url = setLinkUrl({ ticker: params.currency.ticker, address: tx, isTransactionHash: true })
        /* Add Withdraw to user */
        var withdraw = new Withdraw({
            app: params.app,
            user: params.user._id,
            creation_timestamp: new Date(),
            address: params.withdrawAddress, // Deposit Address
            currency: params.currency,
            amount: amount,
            nonce: params.nonce,
            withdrawNotification: params.withdrawNotification,
            fee: fee,
            isAffiliate,
            done: true,
            request_id: transaction,
            transactionHash: tx,
            confirmed: true,
            last_update_timestamp: new Date(),
            link_url: link_url,
            status: tx ? 'Processed' : 'Queue',
        })

        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.userWallet._id, playBalanceDelta);

        /* Update App Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(app_wallet._id, fee);

        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);

        /* Send Email */
        let mail = new Mailer();
        let attributes = {
            TEXT: mail.setTextNotification('WITHDRAW', params.amount, params.currency.ticker)
        };
        mail.sendEmail({ app_id: params.app.id, user: params.user, action: 'USER_NOTIFICATION', attributes });
        return{
            withdraw_id: withdrawSaveObject._id,
            tx: tx,
            autoWithdraw
        };
    },
    __updateWallet: async (params) => {
        try {

            const hmac = crypto.createHmac("SHA256", PRIVATE_KEY);
            const computedHashSignature = hmac.update(JSON.stringify(params)).digest("hex");

            var data = JSON.stringify(params);

            var config = {
            method: 'post',
            url: `${MS_MASTER_URL}/api/user/credit`,
            headers: {
                'x-sha2-signature': computedHashSignature,
                'Content-Type': 'application/json'
            },
            data : data
            };

            await axios(config);

            return params;
        } catch (err) {
            throw err;
        }
    },
    __cancelWithdraw: async (params) => {
        try {
            /* Add Cancel Withdraw to user */
            await WithdrawRepository.prototype.cancelWithdraw(params.withdraw_id, {
                last_update_timestamp: new Date(),
                note: params.note
            });
            await WalletsRepository.prototype.updatePlayBalance(params.wallet_id, params.amount);
            return true;
        } catch (err) {
            throw err;
        }
    },
    __getDepositAddress: async (params) => {
        if(params.wallet){
            return {
                address: params.wallet.address,
                ticker : params.ticker
            }
        }
        let newAddress = {};
        const ticker = String(params.ticker).toUpperCase();
        if (!params.erc20) {
            const subWalletId = (
                await TrustologySingleton
                    .method(ticker)
                    .createSubWallet(
                        ticker=="eth" ? TRUSTOLOGY_WALLETID_ETH.split("/")[0] : TRUSTOLOGY_WALLETID_BTC.split("/")[0],
                        params.id
                    )
            ).data.createSubWallet.subWalletId;
            newAddress = (await TrustologySingleton.method(ticker).getAddress(subWalletId)).data.user.subWallet;
            newAddress["subWalletId"] = newAddress.id;
        } else {
            newAddress = { address: params.wallet.address, subWalletId: params.wallet.subWalletId };
        }

        await WalletRepository.save({
            user        : params.id,
            app         : params.app,
            address     : params.newAddress.address,
            currency    : params.currency,
            subWalletId : newAddress.subWalletId,
            ticker      : params.ticker,
            erc20       : params.erc20
        });

        return {
            address: newAddress.address,
            currency: ticker
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
                case 'RequestWithdraw': {
                    return await library.process.__requestWithdraw(params);
                };
                case 'UpdateWallet': {
                    return await library.process.__updateWallet(params);
                };
                case 'CancelWithdraw': {
                    return await library.process.__cancelWithdraw(params);
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
                case 'RequestWithdraw': {
                    return await library.progress.__requestWithdraw(params);
                };
                case 'UpdateWallet': {
                    return await library.progress.__updateWallet(params);
                };
                case 'CancelWithdraw': {
                    return await library.progress.__cancelWithdraw(params);
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