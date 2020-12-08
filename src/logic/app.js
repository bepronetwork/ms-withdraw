import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository, CurrencyRepository, GamesRepository, JackpotRepository, PointSystemRepository, AutoWithdrawRepository, TxFeeRepository, BalanceRepository, DepositBonusRepository, FreeCurrencyRepository } from '../db/repos';
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
        const walletExtern = (await TrustologySingleton.method(currency.ticker).getAccountIndex(0));
        return  {
            currency,
            app : app,
            address : walletExtern.address,
            subWalletId : `${walletExtern.subWalletId.id}/${walletExtern.subWalletId.type}/${walletExtern.subWalletId.index}`
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
                    virtual : false,
                    bank_address : wallet_eth.bank_address,
                    subWalletId  : wallet_eth.subWalletId
                })).register())._doc;
            }else{
                wallet = (await (new Wallet({
                    currency : currency._id,
                    virtual : false,
                    bank_address : address,
                    subWalletId
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
            currency_id : currency._id,
            bank_address : address
        }
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
                case 'AddCurrencyWallet' : {
					return await library.process.__addCurrencyWallet(params);
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
            }
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AppLogic;

