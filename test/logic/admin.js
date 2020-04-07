const _ = require('lodash');
import { Security } from '../controllers/Security';
import LogicComponent from './logicComponent';
import { SecurityRepository } from '../db/repos';

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
	__login : async (params) => {
        // Get User by Username
        let admin = await __private.db.findAdmin(params.username);
        let has2FASet = admin.security['2fa_set'];
        let bearerToken = Security.prototype.sign(admin._id);
        let normalized = {
            has2FASet,
            bearerToken,
            username : admin.username,
            password : params.password,
            security_id : admin.security._id,
            verifiedAccount : Security.prototype.unhashPassword(params.password, admin.hash_password),
            ...admin
        }
        
		return normalized;
    },
    __login2FA : async (params) => {
        // Get User by Username
        let admin = await __private.db.findAdmin(params.username);
        var has2FASet = admin.security['2fa_set'];
        var secret2FA = admin.security['2fa_secret'];    
        let isVerifiedToken2FA = (new Security()).isVerifiedToken2FA({
            secret : secret2FA,
            token : params['2fa_token']
        });

        let bearerToken = Security.prototype.sign(admin._id);

        let normalized = {
            has2FASet,
            secret2FA,
            bearerToken,
            isVerifiedToken2FA,
            username : admin.username,
            password : params.password,
            security_id : admin.security._id,
            verifiedAccount : Security.prototype.unhashPassword(params.password, admin.hash_password),
            ...admin
        }

        return normalized;
    },
    __auth  : async (params) => {
        // Get User by Username
        let admin = await __private.db.findAdminById(params.admin);
        let normalized = admin;        
        return normalized;
    },
    __set2FA : async (params) => {
        // Get User by Username
        let admin = await __private.db.findAdminById(params.admin);
    
        let isVerifiedToken2FA = (new Security()).isVerifiedToken2FA({
            secret : params['2fa_secret'],
            token : params['2fa_token']
        })


        let normalized = {
            newSecret : params['2fa_secret'],
            username : admin.username,
            isVerifiedToken2FA,
            admin_id : params.admin,
            security_id : admin.security._id,
            ...admin
        }

        return normalized;
    },
	__register : (params) => {
		// TO DO : Hash Password on Client Side
		let password = new Security(params.password).hash();
		let normalized = {
			username 		: params.username,
			name 			: params.name,
            hash_password   : password,
            security 	    : params.security,
			email			: params.email
		}
	
		return normalized;
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
    __login : async (params) => {
        await SecurityRepository.prototype.setBearerToken(params.security_id, params.bearerToken);
        return params;
    },
    __login2FA : async (params) => {    
        await SecurityRepository.prototype.setBearerToken(params.security_id, params.bearerToken);
        return params;
    },
    __auth  : async (params) => {
        return params;
    },
    __set2FA : async (params) => {
        let {
            newSecret,
            security_id
        } = params;
        //Add new Secret
        await SecurityRepository.prototype.addSecret2FA(security_id, newSecret);
        return params;
    },
	__register : async (params) => {
        let user = await self.save(params);
		return user
    }
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


class AdminLogic extends LogicComponent {
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
				case 'Login' : {
					return await library.process.__login(params); break;
                };
                case 'Login2FA' : {
					return await library.process.__login2FA(params); 
                };
                case 'Auth' : {
					return await library.process.__auth(params); 
                };
                case 'Set2FA' : {
					return await library.process.__set2FA(params); 
				};
				case 'Register' : {
					return library.process.__register(params); break;
				};
				
			}
		}catch(error){
			throw error;
		}
	}

	async progress(params, progressAction){
		try{			
			switch(progressAction) {
				case 'Login' : {
					return await library.progress.__login(params); 
                };
                case 'Login2FA' : {
					return await library.progress.__login2FA(params); 
                };
                case 'Auth' : {
					return await library.progress.__auth(params); 
                };
                case 'Set2FA' : {
					return await library.progress.__set2FA(params); 
				};
				case 'Register' : {
					return await library.progress.__register(params); 
                };
                
				
			}
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AdminLogic;