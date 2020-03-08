

import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import _ from 'lodash';
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
	__register : async (params) => {
        const res = {
            ...params,
            privateKey : '2z3xcwerqpw6cc2xx9sr3abzpbptfhm9uqmb5b97yfzxbvgjnvwx374u3jntdz6e',
            publicKey : 'bkuwr8d2t4hp',
            isActive : true
        }
		return res;
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
            
            let chat = await self.save(params);
        
			return {
				...chat,
				type : 'chat'
			};
		}catch(err){
			throw err;
		}
	}
}

/**
 * Main Chat logic.
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
 * @property {Chat_model} model
 * @property {Chat_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class ChatLogic extends LogicComponent {
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
	 * Validates Chat schema.
	 *
	 * @param {Chat} Chat
	 * @returns {Chat} Chat
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
				case 'Register' : {
					return library.process.__register(params); break;
				};
			}
		}catch(err){
			throw err;
		}
	}

	 /**
	 * Tests Chat schema.
	 *
	 * @param {Chat} Chat
	 * @returns {Chat} Chat
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.chat(params, action);
		}catch(err){
			throw err;
		}
	}



	async progress(params, progressAction){
		try{			
			switch(progressAction) {
				case 'Register' : {
					return await library.progress.__register(params);
				}
			}
		}catch(err){
			throw err;
		}
	}
}

// Export Default Module
export default ChatLogic;