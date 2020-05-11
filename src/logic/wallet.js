

const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import { WalletsRepository, AppRepository } from '../db/repos';
import { throwError } from '../controllers/Errors/ErrorManager';
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
	__register : (params) => {
		let normalized = {
            playBalance : 0,
            currency : params.currency,
            bank_address : params.bank_address
        }
		return normalized;
	},
	__updateMaxWithdraw : async (params) => {
		try{
			const app = await AppRepository.prototype.findAppById(params.app);
			if(!app){
				throwError('APP_NOT_EXISTENT');
			}
			const wallet = app.wallet.find( w => new String(w._id).toString() == new String(params.wallet_id).toString());
			if(!wallet){throwError('CURRENCY_NOT_EXISTENT')};

			let normalized = {
				wallet_id	: {_id: params.wallet_id},
				amount 		: params.amount
			}
			return normalized;
		}catch(err){
			throw err;
		}
	},

	__updateMinWithdraw : async (params) => {
		try{
			const app = await AppRepository.prototype.findAppById(params.app);
			if(!app){
				throwError('APP_NOT_EXISTENT');
			}
			const wallet = app.wallet.find( w => new String(w._id).toString() == new String(params.wallet_id).toString());
			if(!wallet){throwError('CURRENCY_NOT_EXISTENT')};

			let normalized = {
				wallet_id	: {_id: params.wallet_id},
				amount 		: params.amount
			}
			return normalized;
		}catch(err){
			throw err;
		}
	},

	__updateAffiliateMinWithdraw : async (params) => {
		try{
			const app = await AppRepository.prototype.findAppById(params.app);
			if(!app){
				throwError('APP_NOT_EXISTENT');
			}
			const wallet = app.wallet.find( w => new String(w._id).toString() == new String(params.wallet_id).toString());
			if(!wallet){throwError('CURRENCY_NOT_EXISTENT')};

			let normalized = {
				wallet_id	: {_id: params.wallet_id},
				amount 		: params.amount
			}
			return normalized;
		}catch(err){
			throw err;
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
	__register : async (params) => {
		try{
			let wallet = await self.save(params);
			return {
				...wallet,
				type : 'wallet'
			};
		}catch(err){
			throw err;
		}
	},
	__updateMaxWithdraw : async (params) => {
		let wallet = await WalletsRepository.prototype.updateMaxWithdraw(
			params.wallet_id,
			params.amount
		);
		return wallet;
	},
	__updateMinWithdraw : async (params) => {
		let wallet = await WalletsRepository.prototype.updateMinWithdraw(
			params.wallet_id,
			params.amount
		);
		return wallet;
	},

	__updateAffiliateMinWithdraw : async (params) => {
		let wallet = await WalletsRepository.prototype.updateAffliateMinWithdraw(
			params.wallet_id,
			params.amount
		);
		return wallet;
	}
}

/**
 * Main Wallet logic.
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
 * @property {Wallet_model} model
 * @property {Wallet_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class WalletLogic extends LogicComponent {
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
	 * Validates Wallet schema.
	 *
	 * @param {Wallet} Wallet
	 * @returns {Wallet} Wallet
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{
			switch(processAction) {
				case 'Register' : {
					return library.process.__register(params); break;
				};
				case 'UpdateMaxWithdraw' : {
					return await library.process.__updateMaxWithdraw(params);
				};
				case 'UpdateMinWithdraw' : {
					return await library.process.__updateMinWithdraw(params);
				};
				case 'UpdateAffiliateMinWithdraw' : {
					return await library.process.__updateAffiliateMinWithdraw(params);
				};
			}
		}catch(report){
			throw `Failed to validate Wallet schema: Wallet \n See Stack Trace : ${report}`;
		}
	}

	 /**
	 * Tests Wallet schema.
	 *
	 * @param {Wallet} Wallet
	 * @returns {Wallet} Wallet
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.wallet(params, action);
		}catch(err){
			throw err;
		}
	}



	async progress(params, progressAction){
		try{
			switch(progressAction) {
				case 'Register' : {
					return await library.progress.__register(params);
				};
				case 'UpdateMaxWithdraw' : {
					return await library.progress.__updateMaxWithdraw(params);
				};
				case 'UpdateMinWithdraw' : {
					return await library.progress.__updateMinWithdraw(params);
				};
				case 'UpdateAffiliateMinWithdraw' : {
					return await library.progress.__updateAffiliateMinWithdraw(params);
				};
			}
		}catch(report){
			throw `Failed to validate Wallet schema: Wallet \n See Stack Trace : ${report}`;
		}
	}
}

// Export Default Module
export default WalletLogic;