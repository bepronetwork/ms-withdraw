

import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import _ from 'lodash';
import { AffiliateSetupRepository, AffiliateStructureRepository } from '../db/repos';
import { AffiliateStructure } from '../models';
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
        const { previousAffiliateSetup, structures } = params;

		return {
            previousAffiliateSetup,
            structures
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
        const { previousAffiliateSetup, structures } = params;
        var currentAffiliateStructures = [];
		try{                
            if(previousAffiliateSetup && !_.isEmpty(previousAffiliateSetup)){
                /* Updating Affiliate */
                currentAffiliateStructures = previousAffiliateSetup.affiliateStructures;
            }
            /* Add new Structures */
            var newAffiliateStructure = structures.map( s => {
                const equalStructureLevel = currentAffiliateStructures.find(aff => aff.level == s.level);
                if(equalStructureLevel){
                    return{
                        _id                 : equalStructureLevel._id,
                        level               : s.level,
                        percentageOnLoss    : s.percentageOnLoss,
                        isActive            : true
                    }
                }else{
                    return {
                        level               : s.level,
                        percentageOnLoss    : s.percentageOnLoss,
                        isActive            : true
                    }
                }
             
            }).filter(el => el != null);
            /* If the structure takes ones, make them inactive */
            newAffiliateStructure = newAffiliateStructure.concat(currentAffiliateStructures.map( s => {
                const hasAffiliate = newAffiliateStructure.find( cs => cs.level == s._doc.level);
                const hasAskedAffiliate = structures.find( cs => cs.level == s._doc.level);
                if(!hasAffiliate && !hasAskedAffiliate){
                    return {
                        ...s._doc,
                        isActive : false,
                    }
                }
            }).filter(el => el != null));

            let affiliatedStructures = newAffiliateStructure.map( async a => {
                if(a._id){
                    /* Id already exists - Update */
                    (await AffiliateStructureRepository.prototype.findByIdAndUpdate(a._id, a));
                    return a._id;
                }else{
                    a = await (new AffiliateStructure(a)).register()
                    /* Id does not exist - Create */
                    return a._id
                }
            })

            let affiliatedStructuresIds = await Promise.all(affiliatedStructures);

            let affiliateSetup = await self.save({
                affiliateStructures : affiliatedStructuresIds
            });
            return {
				...affiliateSetup,
				type : 'affiliateSetup'
			};
		}catch(err){
            throw err;
		}
	}
}

/**
 * Main AffiliateSetup logic.
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
 * @property {AffiliateSetup_model} model
 * @property {AffiliateSetup_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AffiliateSetupLogic extends LogicComponent {
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
	 * Validates AffiliateSetup schema.
	 *
	 * @param {AffiliateSetup} AffiliateSetup
	 * @returns {AffiliateSetup} AffiliateSetup
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
	 * Tests AffiliateSetup schema.
	 *
	 * @param {AffiliateSetup} AffiliateSetup
	 * @returns {AffiliateSetup} AffiliateSetup
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.affiliateSetup(params, action);
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
export default AffiliateSetupLogic;