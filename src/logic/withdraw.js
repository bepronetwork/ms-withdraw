


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';

let error = new ErrorManager();

const config = {
    headers : {
        "Content-Type" : "application/json"
    }
}

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
    __createWithdraw : async (params) => {
        
        let entityType = params.user ? 'user' : 'app';

        let normalized = {
            app                     : params.app,
			[entityType]			: params[entityType],
            entityType				: entityType,
            creation_timestamp      : params.creation_timestamp,                        
            last_update_timestamp   : params.last_update_timestamp,                      
            address                 : params.address,                       
            currency                : params.currency,
            logId                   : params.logId,
            transactionHash         : params.transactionHash,
            amount                  : params.amount,
            confirmations           : params.confirmations || 0,
			maxConfirmations        : params.maxConfirmations || 0,
			link_url				: params.link_url,
            ...params
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
    __createWithdraw : async (params) => {
        let withdraw = await self.save(params);
		return withdraw;
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


class WithdrawsLogic extends LogicComponent {
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
                case 'CreateWithdraw' : {
					return library.process.__createWithdraw(params); break;
				}
			}
		}catch(report){
			throw `Failed to validate Withdraw schema: Withdraw \n See Stack Trace : ${report}`;
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
		try{
			error.withdraw(params, action);
		}catch(err){
			throw err;
		}
	}


	async progress(params, progressAction){
		try{			
			switch(progressAction) {
                case 'CreateWithdraw' : {
					return library.progress.__createWithdraw(params); break;
				}
			}
		}catch(report){
			throw `Failed to validate Withdraw schema: Withdraw \n See Stack Trace : ${report}`;
		}
	}
}

// Export Default Module
export default WithdrawsLogic;