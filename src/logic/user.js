const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import Numbers from './services/numbers';

import {DepositRepository, WalletRepository, WithdrawRepository } from '../db/repos';
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

    __finalizeWithdraw: async (params) => {
        try {
            return params;
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

        const deposits = await DepositRepository.getAll({
            user,
            app,
            size,
            offset 
        });
        const withdraws = await WithdrawRepository.getAll({
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
        let { sendTo, isAutoWithdraw, ticker, isAffiliate, app, user, amount, nonce, withdrawNotification, fee } = params;
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
            address     : newAddress.address,
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
                let ticker = (withdraw.currency_ticker.toUpperCase()) == "BTC" ? "BTC" : "ETH";
                const getTransaction =  (await TrustologySingleton.method(ticker).getTransaction(withdraw.request_id)).data.getRequest;
                const tx = getTransaction.transactionHash
                let status = 'Canceled';
                let note = "The withdrawal was canceled by the administrator, the money has already returned to your account."
                if(withdraw.status.toUpperCase() != 'CANCELED'){
                    status = tx ? 'Processed' : 'Queue';
                    note = (status == 'Processed') ? "Successful withdrawal" : "Withdrawal waiting"
                } 
                // if(getTransaction.status == 'USER_CANCELLED' && withdraw.status.toUpperCase() != 'CANCELED'){
                //     const app_wallet = app.wallet.find(w => new String(w.currency._id).toString() == new String(withdraw.currency._id).toString());
                //     const user_wallet = user.wallet.find(w => new String(w.currency._id).toString() == new String(withdraw.currency._id).toString());
                //     await WalletsRepository.prototype.updatePlayBalance(app_wallet._id, -(parseFloat(withdraw.fee)));
                //     await WalletsRepository.prototype.updatePlayBalance(user_wallet._id, parseFloat(withdraw.amount));
                // }
                const link_url = setLinkUrl({ ticker: withdraw.currency_ticker, address: tx, isTransactionHash: true })
                await WithdrawRepository.findByIdAndUpdateTX({
                    _id: withdraw._id,
                    tx,
                    link_url,
                    status: status,
                    note: note,
                    last_update_timestamp: new Date()
                });
            }
        }

        const withdraws_updated = await WithdrawRepository.getAll({
            user,
            app,
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