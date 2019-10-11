

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
        const { level, percentageOnLoss } = params;

		return {
            level,
            percentageOnLoss
        };
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
			let affiliateStructure = await self.save(params);
			return {
				...affiliateStructure._doc,
				type : 'affiliateStructure'
			};
		}catch(err){
			throw err;
		}
	}
}

/**
 * Main AffiliateStructure logic.
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
 * @property {AffiliateStructure_model} model
 * @property {AffiliateStructure_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AffiliateStructureLogic extends LogicComponent {
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
	 * Validates AffiliateStructure schema.
	 *
	 * @param {AffiliateStructure} AffiliateStructure
	 * @returns {AffiliateStructure} AffiliateStructure
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
            console.log(err);
            throw err;
		}
	}

	 /**
	 * Tests AffiliateStructure schema.
	 *
	 * @param {AffiliateStructure} AffiliateStructure
	 * @returns {AffiliateStructure} AffiliateStructure
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.affiliateStructure(params, action);
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
            console.log(err)
            throw err;
		}
	}
}

// Export Default Module
export default AffiliateStructureLogic;