


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import { TokensRepository, BlockchainsRepository, AuthorizedsRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import GamesEcoRepository from '../db/repos/ecosystem/game';
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
    __getEcosystemData : async () => {

        // Get Currencies
        let currencies = await TokensRepository.prototype.getAll();
        // Get Blockchains
        let blockchains = await BlockchainsRepository.prototype.getAll();
        // Get Address Authorized
		let addresses = await AuthorizedsRepository.prototype.getAll();

        let normalized = {
            currencies : currencies,
            blockchains : blockchains,
            addresses : addresses
        };
        
		return normalized;
    },
    __getCasinoGames : async () => {
        // Get Games
        let games = await GamesEcoRepository.prototype.getAll();
		return games;
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
	__getEcosystemData : async (params) => {
        return params;
    },
    __getCasinoGames : async (params) => {
        return params;
	}
}
/**
 * Main Ecosystem logic.
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
 * @property {Ecosystem_model} model
 * @property {Ecosystem_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class EcosystemLogic extends LogicComponent{
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
	 * Validates Ecosystem schema.
	 *
	 * @param {Ecosystem} Ecosystem
	 * @returns {Ecosystem} Ecosystem
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
				case 'GetEcosystemData' : {
					return await library.process.__getEcosystemData(params); break;
                };
                case 'GetCasinoGames' : {
					return await library.process.__getCasinoGames(params); break;
				};
			}
		}catch(error){
			throw error;
		}
	}

	 /**
	 * Tests Ecosystem schema.
	 *
	 * @param {Ecosystem} Ecosystem
	 * @returns {Ecosystem} Ecosystem
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
	
	}

	async progress(params, progressAction){
		try{			
			switch(progressAction) {
				case 'GetEcosystemData' : {
					return await library.progress.__getEcosystemData(params); break;
                };
                case 'GetCasinoGames' : {
					return await library.progress.__getCasinoGames(params); break;
				};
			}
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default EcosystemLogic;

