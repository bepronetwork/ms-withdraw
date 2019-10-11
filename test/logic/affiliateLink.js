

import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import { AffiliateLinkRepository, AppRepository, AffiliateRepository } from '../db/repos';
import { throwError } from '../controllers/Errors/ErrorManager';
import _ from 'lodash';
import { AffiliateLink } from '../models';
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
        
        var { affiliateLink, userAffiliated, notSaveParents=false, app_id, affiliateStructure, affiliate } = params;
        var selfParentAffiliateLinks = [], affiliateStructureInitial;
        let affilateParentObject = await AffiliateLinkRepository.prototype.findById(affiliateLink);
        var app = await AppRepository.prototype.findAppById(app_id, 'affiliates');
        if(!app || typeof app == (undefined || null) || _.isEmpty(app)){throwError('APP_NOT_EXISTENT')}
        const { affiliateSetup } = app;
        const { affiliateStructures } = affiliateSetup;

        affiliateStructureInitial = affiliateStructure ? affiliateStructure : affiliateStructures.find( a => a.level == 1)._id;
        const maxAffiliateLevel = Math.max(...affiliateStructures.map(o => o.level), 0);

        if(!notSaveParents && affilateParentObject){
            /* If has Affiliate Parent */
            var { parentAffiliatedLinks, affiliateStructure, affiliate } = affilateParentObject;
            if(!parentAffiliatedLinks){parentAffiliatedLinks = []}

            selfParentAffiliateLinks = parentAffiliatedLinks.map( paf => { 
                const nextAffiliateLevel = paf.affiliateStructure.level + 1;
                const nextAffiliateStructure = affiliateStructures.find( a => a.level == nextAffiliateLevel);
                if(!nextAffiliateStructure){return null}
                /* If Affiliate level surpasses App Limit for MLM Level */
                if(nextAffiliateLevel > maxAffiliateLevel){return null}
            
                return {
                    userAffiliated : userAffiliated,
                    affiliate : paf.affiliate,
                    affiliateStructure : nextAffiliateStructure
                }
                
            }).filter(el => el != null);   
            selfParentAffiliateLinks.push({
                /* Add Initial Parent */
                userAffiliated : userAffiliated,
                affiliate : affiliate._id,
                affiliateStructure : affiliateStructure
            })        

        }else{
            /* If Does not have Affiliate Parent */
        }

		return {
            userAffiliated,
            app_id : app_id,
            affiliate : affiliate,
            parentAffiliatedLinks : selfParentAffiliateLinks,
            affiliateStructure : affiliateStructureInitial
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

        const { parentAffiliatedLinks, app_id } = params;
       
        /* Save all ResultSpaces */
        let dependentObjects = Object.keys(parentAffiliatedLinks).map( async key => 
            await (new AffiliateLink({...parentAffiliatedLinks[key], notSaveParents : true, app_id})).register()
        );

        let parentAffiliatedLinksIds = await Promise.all(dependentObjects);
        let affiliateLink = await self.save({
            ...params,
            parentAffiliatedLinks : parentAffiliatedLinksIds
        });

        return {
            ...affiliateLink._doc,
            parentAffiliatedLinks,
            type : 'affiliateLink'
        };
       
	}
}

/**
 * Main AffiliateLink logic.
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
 * @property {AffiliateLink_model} model
 * @property {AffiliateLink_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AffiliateLinkLogic extends LogicComponent {
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
	 * Validates AffiliateLink schema.
	 *
	 * @param {AffiliateLink} AffiliateLink
	 * @returns {AffiliateLink} AffiliateLink
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
	 * Tests AffiliateLink schema.
	 *
	 * @param {AffiliateLink} AffiliateLink
	 * @returns {AffiliateLink} AffiliateLink
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		try{
			error.affiliateLink(params, action);
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
export default AffiliateLinkLogic;