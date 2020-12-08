


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';

import { UsersRepository, AppRepository, WalletsRepository, WithdrawRepository, AddOnRepository, AutoWithdrawRepository, CurrencyRepository, DepositRepository } from '../db/repos';
import Numbers from './services/numbers';
import { Deposit, Withdraw, Address } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import Mailer from './services/mailer';
import { setLinkUrl } from '../helpers/linkUrl';
import { getCurrencyAmountFromBitGo } from "./third-parties/bitgo/helpers";
import { TrustologySingleton } from './third-parties';
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
            var { currency, id } = params;

            /* Get User Info */
            let user = await UsersRepository.prototype.findUserById(id);
            if (!user) { throwError('USER_NOT_EXISTENT') }
            const wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(currency).toString());
            if (!wallet || !wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };

            /* Get App Info */
            var app = await AppRepository.prototype.findAppById(user.app_id._id, "simple");
            if (!app) { throwError('APP_NOT_EXISTENT') }
            let ticker = params.ticker;
            var amount = null;
            switch (ticker.toLowerCase()) {
                case 'eth':
                    if (params.token_symbol == null || params.token_symbol == undefined) {
                        amount = getCurrencyAmountFromBitGo({
                            amount: params.payload.value,
                            ticker
                        });
                    } else {
                        amount = parseFloat(params.payload.token_transfers[0].value)
                    }
                    break;
                default:
                    amount = params.payload.value
                    break;
            }
            const app_wallet = app.wallet.find(w => new String(w.currency._id).toLowerCase() == new String(currency).toLowerCase());
            currency = app_wallet.currency._id;
            if (!app_wallet || !app_wallet.currency) { throwError('CURRENCY_NOT_EXISTENT') };
            let addOn = app.addOn;
            let fee = 0;
            if (addOn && addOn.txFee && addOn.txFee.isTxFee) {
                fee = addOn.txFee.deposit_fee.find(c => new String(c.currency).toString() == new String(currency).toString()).amount;
            }
            // /* Verify if the transactionHash was created */
            // const { state, entries, value: amount, type, txid: transactionHash, wallet: bitgo_id, label } = wBT;

            const from = params.payload.from;
            const to = params.payload.to;
            var isPurchase = false, virtualWallet = null, appVirtualWallet = null;
            const isValid = (params.payload.status === "0x1");

            if (ETH_FEE_VARIABLE == from) { throwError('PAYMENT_FORWARDING_TRANSACTION') }
            if (wallet.depositAddresses.find(c => new String(c.currency).toString() == new String(currency).toString()).address == from) { throwError('PAYMENT_FORWARDING_TRANSACTION') }

            /* Verify if this transactionHashs was already added */
            let deposit = await DepositRepository.prototype.getDepositByTransactionHash(params.txHash);
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
                transactionHash: params.txHash,
                from: from,
                currencyTicker: wallet.currency.ticker,
                amount,
                isValid,
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
            console.log(user_wallet.depositAddresses[0]);
            return {
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
        if (params.isAutomaticWithdraw.verify) {
            transaction = await TrustologySingleton.method(ticker).autoSendTransaction(
                params.withdrawAddress,
                (parseFloat(amount) * (Math.pow(10, ((ticker == "BTC") ? 8 : 18)))).toString(),
                ((ticker == "BTC") ? null : params.ticker.toUpperCase()),
            );
            tx = await TrustologySingleton.method(ticker).getTransaction(transaction).data.getRequest.transactionHash;
        } else {
            transaction = await TrustologySingleton.method(ticker).sendTransaction(
                ((ticker == "BTC") ? params.app_wallet.subWalletId : params.appAddress),
                params.withdrawAddress,
                (parseFloat(amount) * (Math.pow(10, ((ticker == "BTC") ? 8 : 18)))).toString(),
                ((ticker == "BTC") ? null : params.ticker.toUpperCase()),
            );
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
            status: 'Processed',
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
            tx: tx
        };
    },
    __updateWallet: async (params) => {
        try {
            /* Create Deposit Object */
            let deposit = new Deposit({
                user: params.user,
                transactionHash: params.transactionHash,
                creation_timestamp: params.creationDate,
                last_update_timestamp: params.creationDate,
                address: params.from, // Deposit Address
                currency: params.currencyTicker,
                amount: params.amount,
            })

            /* Save Deposit Data */
            let depositSaveObject = await deposit.createDeposit();

            /* Update Balance of App */
            await WalletsRepository.prototype.updatePlayBalance(params.wallet, Numbers.toFloat(params.amount));

            /* Add Deposit to user */
            await UsersRepository.prototype.addDeposit(params.user_id, depositSaveObject._id);

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
            }
        } catch (err) {
            throw err;
        }
    }
}

// Export Default Module
export default UserLogic;