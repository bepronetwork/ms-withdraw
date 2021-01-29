import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository, CurrencyRepository, GamesRepository, JackpotRepository, PointSystemRepository, AutoWithdrawRepository, TxFeeRepository, BalanceRepository, DepositBonusRepository, FreeCurrencyRepository, AffiliateRepository, DepositRepository, WithdrawRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { Wallet } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';
import { TrustologySingleton } from './third-parties';
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
    __addCurrencyWallet : async (params) => {
        var { currency_id, app } = params;
        app = await AppRepository.prototype.findAppByIdAddCurrencyWallet(app);
        if(!app){throwError('APP_NOT_EXISTENT')}
        let currency = await CurrencyRepository.prototype.findById(currency_id);
        return  {
            currency,
            app : app
        }
    },
    __getAllTransactions: async (params) => {
        try {
            let { user, size, app, offset, begin_at, end_at } = params;

            const deposits = await DepositRepository.getAllBackoffice({
                app,
                user: !user ? null : user,
                size,
                offset,
                begin_at,
                end_at
            });
            const withdraws = await WithdrawRepository.getAllBackoffice({
                app,
                user: !user ? null : user,
                size,
                offset,
                begin_at,
                end_at
            });
            return {
                deposits: deposits,
                withdraws: withdraws,
                app,
                user,
                size,
                offset
            };
        } catch (error) {
            console.log(error)
        }
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
    __addCurrencyWallet : async (params) => {
        const { currency, address, app, subWalletId } = params;
        var wallet;
        if(currency.virtual){
            /* Save Wallet on DB */
            wallet = (await (new Wallet({
                currency : currency._id,
                virtual : true,
                price : app.currencies.map( c => {
                    return {
                        currency : c._id,
                        amount : PRICE_VIRTUAL_CURRENCY_GLOBAL
                    }
                })
            })).register())._doc;
        }else{
            if(currency.erc20){
                let wallet_eth = app.wallet.find( w => w.currency.ticker == 'ETH');
                /* No Eth Wallet was created */
                if(!wallet_eth){throwError('NO_ETH_WALLET')};
                /* Save Wallet on DB */
                wallet = (await (new Wallet({
                    currency : currency._id,
                    virtual : false
                })).register())._doc;
            }else{
                wallet = (await (new Wallet({
                    currency : currency._id,
                    virtual : false
                })).register())._doc;
            }
            let virtualWallet = app.wallet.find( w => w.currency.virtual == true);
            if(virtualWallet){
                /* Add Deposit Currency to Virtual Currency */
                await WalletsRepository.prototype.addCurrencyDepositToVirtualCurrency(virtualWallet._id, currency._id);
            }
        }

        /* Add Currency to Platform */
        await AppRepository.prototype.addCurrency(app._id, currency._id);
        await AppRepository.prototype.addCurrencyWallet(app._id, wallet);

        /* Add LimitTable to all Games */
        if(app.games!=undefined) {
            for(let game of app.games) {
                await GamesRepository.prototype.addTableLimitWallet({
                    game    : game._id,
                    wallet  : wallet._id
                });
            }
        }

        /* add currencies in addons */
        if(app.addOn.jackpot)         await JackpotRepository.prototype.pushNewCurrency(app.addOn.jackpot._id, currency._id);
        if(app.addOn.pointSystem)     await PointSystemRepository.prototype.pushNewCurrency(app.addOn.pointSystem._id, currency._id);
        if(app.addOn.autoWithdraw)    await AutoWithdrawRepository.prototype.pushNewCurrency(app.addOn.autoWithdraw._id, currency._id);
        if(app.addOn.txFee)           await TxFeeRepository.prototype.pushNewCurrency(app.addOn.txFee._id, currency._id);
        if(app.addOn.balance)         await BalanceRepository.prototype.pushNewCurrency(app.addOn.balance._id, currency._id);
        if(app.addOn.depositBonus)    await DepositBonusRepository.prototype.pushNewCurrency(app.addOn.depositBonus._id, currency._id);
        if(app.addOn.freeCurrency)    await FreeCurrencyRepository.prototype.pushNewCurrency(app.addOn.freeCurrency._id, currency._id);
        console.log("setting user")

        /* Add Wallet to all Users */
        await Promise.all(await app.users.map( async u => {
            let w = (await (new Wallet({
                currency : currency._id,
            })).register())._doc;
            await UsersRepository.prototype.addCurrencyWallet(u._id, w);

            let wAffiliate = (await (new Wallet({
                currency : currency._id,
            })).register())._doc;
            await AffiliateRepository.prototype.addCurrencyWallet(u.affiliate, wAffiliate);
        }));
        

        return {
            currency_id : currency._id
        }
    },
    __getAllTransactions: async (params) => {
        try {
            let { withdraws, app, user, size, offset, deposits } = params;
            let withdraws_updated = withdraws;
            if (withdraws.length != 0) {
                for (let withdraw of withdraws) {
                    if (!withdraw.transactionHash) {
                        let ticker = (withdraw.currency_ticker.toUpperCase()) == "BTC" ? "BTC" : "ETH";
                        const getTransaction = (await TrustologySingleton.method(ticker).getTransaction(withdraw.request_id)).data.getRequest;
                        const tx = getTransaction.transactionHash
                        let status = 'Canceled';
                        let note = "The withdrawal was canceled by the administrator, the money has already returned to your account."
                        if (getTransaction.status.toUpperCase() != 'USER_CANCELLED' && withdraw.status.toUpperCase() != 'CANCELED') {
                            status = tx ? 'Processed' : 'Queue';
                            note = (status == 'Processed') ? "Successful withdrawal" : "Withdrawal waiting"
                        }
                        if (getTransaction.status.toUpperCase() == 'USER_CANCELLED' && withdraw.status.toUpperCase() != 'CANCELED') {
                            const body = {
                                app,
                                user,
                                amount: withdraw.amount,
                                fee: withdraw.fee,
                                ticker: withdraw.currency_ticker,
                                isAffiliate: withdraw.isAffiliate
                            }
                            const hmac = crypto.createHmac("SHA256", PRIVATE_KEY);
                            const hash = hmac.update(JSON.stringify(body)).digest("hex");
                            var data = JSON.stringify(body);
                            var config = {
                                method: 'post',
                                url: UPDATE_BALANCE_WITHDRAW_CANCELED_URL,
                                headers: {
                                    'x-sha2-signature': hash,
                                    'Content-Type': 'application/json'
                                },
                                data: data
                            };

                            const res = (await axios(config)).data;
                            console.log("res:: ", res)

                            const link_url = setLinkUrl({ ticker: withdraw.currency_ticker, address: tx, isTransactionHash: true })
                            await WithdrawRepository.findByIdAndUpdateTX({
                                id: withdraw.id,
                                tx,
                                link_url,
                                status: status,
                                note: note,
                                last_update_timestamp: new Date()
                            });
                        }
                    }
                }
                withdraws_updated = WithdrawRepository.getAllBackoffice({
                    app,
                    user: !user ? null : user,
                    size,
                    offset,
                    begin_at,
                    end_at
                });
            }

            return {
                deposits,
                withdraws: withdraws_updated
            };
        } catch (error) {
            console.log(error);
        }
    },
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
                case 'AddCurrencyWallet' : {
					return await library.process.__addCurrencyWallet(params);
                };
                case 'GetAllTransactions': {
                    return await library.process.__getAllTransactions(params);
                };
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
                case 'AddCurrencyWallet' : {
					return await library.progress.__addCurrencyWallet(params);
                };
                case 'GetAllTransactions': {
                    return await library.process.__getAllTransactions(params);
                };
            }
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AppLogic;
