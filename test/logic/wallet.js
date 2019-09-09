

const _ = require('lodash');
import LogicComponent from './logicComponent';
import { WalletsRepository, UsersRepository, AppRepository } from '../db/repos';
import DepositsRepository from '../db/repos/deposit';


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
	__register : (params) => {
		let normalized = {
            playBalance : 0
        }
		return normalized;
	},
	__confirmDeposit : async (params) => {
		try{
			let entity, entityType;
			switch(entityType = params.user ? 'user' : 'app'){
				case 'user' : {
					entity = await UsersRepository.prototype.findUserById(params.user);
				};
				case 'app' : {
					entity = await AppRepository.prototype.findAppById(params.app);
				}
			}
			//Set up Password Structure
			let normalized = {
				id					: entity.wallet._id,
				currency 			: params.currency,
				amount 				: params.amount
			}
			return normalized;
		}catch(err){
			throw err
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
	__register : async (params) => {
		try{
			let wallet = await self.save(params);
			return {
				...wallet,
				type : 'wallet'
			};
		}catch(err){
			throw err
		}
	},
	__confirmDeposit : async (params) => {
        // 1 - Confirm Deposit in Serve
		let wallet = await WalletsRepository.prototype.updateCurrencyAmount(
			params.id, 
			params.currency,
			params.amount
		);
		// 2 - Return Confirmation Object
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
				case 'ConfirmDeposit' : {
					return await library.process.__confirmDeposit(params);
				};
			}
		}catch(report){
			throw `Failed to validate Wallet schema: Wallet \n See Stack Trace : ${report}`;
		}
	}

	async progress(params, progressAction){
		try{			
			switch(progressAction) {
				case 'Register' : {
					return await library.progress.__register(params);
				}
				case 'ConfirmDeposit' : {
					return await library.progress.__confirmDeposit(params);
				}
			}
		}catch(report){
			throw `Failed to validate Wallet schema: Wallet \n See Stack Trace : ${report}`;
		}
	}
}

// Export Default Module
export default WalletLogic;