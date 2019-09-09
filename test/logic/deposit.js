


const _ = require('lodash');
import { Security } from '../controllers/Security';
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import ConverterSingleton from './utils/converter';
import { Deposit, User } from '../models';
import { DepositRepository, AppRepository, UsersRepository, WalletsRepository } from '../db/repos';
import { globals } from '../Globals';
import axios from 'axios';

let error = new ErrorManager();

const config = {
    headers : {
        "Content-Type" : "application/json"
    }
}

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
    __createDeposit : async (params) => {
        
        let entityType = params.user ? 'user' : 'app';

        let normalized = {
			[entityType]			: params[entityType],
            entityType				: entityType,
            creation_timestamp      : params.creation_timestamp,                        
            last_update_timestamp   : params.last_update_timestamp,                      
            address                 : params.address,                       
            currency                : params.currency,
            transactionHash         : params.transactionHash,
            amount                  : params.amount,
            confirmations           : params.confirmations || 0,
            maxConfirmations        : params.maxConfirmations || 0,
		}
		return normalized;
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
	__confirm : async (params) => {

        /* Confirm Deposit in Serve */
		let deposit = await DepositRepository.prototype.confirmDeposit(params._doc._id, params);
		// TO DO : Convert ETH/BTC to the Stale Token and Transfer it to a Wallet
        
		/* Update Deposits Setup for User or App */
	
		switch(params.entityType){
			case 'user' : {
                await UsersRepository.prototype.addDeposit(params[params.entityType], deposit);
                await WalletsRepository.prototype.updatePlayBalance(params.wallet, params.usd_amount);
			};
			case 'app' : {
                await AppRepository.prototype.addDeposit(params[params.entityType], deposit);
                await WalletsRepository.prototype.updatePlayBalance(params.wallet, params.usd_amount);
			}
        }
		
		return deposit;
    },
    __createDeposit : async (params) => {
        let deposit = await self.save(params);
		return deposit;
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


class DepositsLogic extends LogicComponent {
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
                case 'CreateDeposit' : {
					return library.process.__createDeposit(params); break;
				}
			}
		}catch(report){
			throw `Failed to validate Deposit schema: Deposit \n See Stack Trace : ${report}`;
		}
	}

	 /**
	 * Tests user schema.
	 *
	 * @param {user} user
	 * @returns {user} user
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		
	}


	async progress(params, progressAction){
		try{			
			switch(progressAction) {
                case 'CreateDeposit' : {
					return library.progress.__createDeposit(params); break;
				}
			}
		}catch(report){
			throw `Failed to validate Deposit schema: Deposit \n See Stack Trace : ${report}`;
		}
	}
}

// Export Default Module
export default DepositsLogic;