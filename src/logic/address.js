const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
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
	__register : (params) => {
		return params;
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
			let Address = await self.save(params);
			return {
				...Address,
				type : 'address'
			};
		}catch(err){
			throw err;
		}
	}
}

/**
 * Main Address logic.
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
 * @property {Address_model} model
 * @property {Address_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AddressLogic extends LogicComponent {
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
	 * Validates Address schema.
	 *
	 * @param {Address} Address
	 * @returns {Address} Address
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
				case 'Register' : {
					return library.process.__register(params); break;
				};
			}
		}catch(error){
			throw error;
		}
	}

	 /**
	 * Tests Address schema.
	 *
	 * @param {Address} Address
	 * @returns {Address} Address
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.address(params, action);
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
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AddressLogic;