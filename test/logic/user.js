


const _ = require('lodash');
import { Security } from '../controllers/Security';
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import { UsersRepository, AppRepository, WalletsRepository, DepositRepository, WithdrawRepository, AffiliateLinkRepository, AffiliateRepository } from '../db/repos';
import Numbers from './services/numbers';
import { verifytransactionHashDepositUser, verifytransactionHashWithdrawUser } from './services/services';
import { Deposit, Withdraw, AffiliateLink } from '../models';
import CasinoContract from './eth/CasinoContract';
import codes from './categories/codes';
import { globals } from '../Globals';
import { throwError } from '../controllers/Errors/ErrorManager';
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
	__login : async (params) => {
        var input_params = params;
        let normalized = {};
        let user = await __private.db.findUser(params.username);     
        if(!user){throwError('USER_NOT_EXISTENT')}
        var app = user.app_id; 
        var user_in_app = (app._id == params.app);
		if(user){
			normalized = {
				username : user.username,
				password : input_params.password,
                user_in_app,
				verifiedAccount : new Security().unhashPassword(input_params.password, user.hash_password),
				...user
			}
		}
		return normalized;
	},
	__register : async (params) => {

        const { affiliateLink, affiliate } = params;

        var input_params = params;
		//Set up Password Structure
        let user, hash_password;

        let app = await AppRepository.prototype.findAppById(params.app);
        if(!app){throwError('APP_NOT_EXISTENT')}

        if(params.user_external_id){
            // User is Extern (Only Widget Clients)
            user = await AppRepository.prototype.findUserByExternalId(input_params.app, input_params.user_external_id);
        }else{
            // User is Intern 
            user = await UsersRepository.prototype.findUser(input_params.username);
        }

        let isAddressAlreadyRegistered = (await UsersRepository.prototype.findUserByAddress({
            address : params.address,
            app     : params.app
        })) ? true : false;

        let alreadyExists = user ? true : false;
        // TO DO : Hash Password on Client Side
        if(params.password)
		    hash_password = new Security(params.password).hash();

		let normalized = {
            isAddressAlreadyRegistered,
			alreadyExists	: alreadyExists,
			username 		: params.username,
            full_name		: params.full_name,
            name 			: params.name,
            address         : params.address,
			hash_password,
            wallet 			: params.wallet,
            register_timestamp : new Date(),
            nationality		: params.nationality,
            affiliate,
			age				: params.age,
            email			: params.email,
            affiliateLink,
			app_id			    : params.app,
			external_user	: params.user_external_id ? true : false,
			external_id		: params.user_external_id
		}
	
		return normalized;
	},
	__summary : async (params) => {
		let res = await UsersRepository.prototype.getSummaryStats(params.type, params.user)
		let normalized = {
			...res
		}
		return normalized;
    },
    __updateWallet : async (params) => {
        try{
            if(params.amount <= 0){throwError('INVALID_AMOUNT')}
            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}

            /* Verify if the transactionHash was created */
            let { isValid, from } = await verifytransactionHashDepositUser(
                app.blockchain, params.transactionHash, params.amount, 
                app.platformAddress , app.decimals)
                
            /* Verify if this transactionHashs was already added */
            let deposit = await DepositRepository.prototype.getDepositByTransactionHash(params.transactionHash);
            let wasAlreadyAdded = deposit ? true : false;

            /* Verify if User Address is Valid */
            let isValidAddress = (new String(user.address).toLowerCase() == new String(from).toLowerCase());

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            let res = {
                isValidAddress,
                app,
                user_in_app,
                wasAlreadyAdded,
                user_id             : user._id,
                wallet              : user.wallet._id,
                creationDate        : new Date(),
                transactionHash     : params.transactionHash,
                from                : from,
                currencyTicker      : app.currencyTicker,
                amount              : Numbers.toFloat(params.amount),
                isValid
            }

            return res;
        }catch(err){
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {
        try{
            var params_input = params;
            var transaction_params = { }, tokenDifferenceDecentralized;

            /* Get User Id */
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            
            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                contractAddress     : app.platformAddress,
                tokenAddress        : app.platformTokenAddress
            })

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);
            
            /* Verify if this transactionHashs was already added */
            let withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionHash(params.transactionHash);
            let wasAlreadyAdded = withdraw ? true : false;

            withdraw = await WithdrawRepository.prototype.findWithdrawById(params.withdraw_id);
            let withdrawExists = withdraw ? true : false;

            /* Verify App Balance in Smart-Contract
            let currentOpenWithdrawingAmount = await casinoContract.getApprovedWithdrawAmount(
                {address : user.address, decimals : app.decimals});
            
            var hashWithdrawingPositionOpen = (currentOpenWithdrawingAmount != 0 ) ? true : false;
            */
            /* Verify User Balance in API */
            let currentAPIBalance = Numbers.toFloat(user.wallet.playBalance);
    
            /* Withdraw Occured in the Smart-Contract */
            transaction_params = await verifytransactionHashWithdrawUser(
                'eth', params_input.transactionHash, app.platformAddress, app.decimals
            )

            let transactionIsValid = transaction_params.isValid;

            if(transactionIsValid){
                /* Transaction is Valid */
                tokenDifferenceDecentralized = Numbers.toFloat(Numbers.fromDecimals(transaction_params.tokenAmount, app.decimals));
            }else{
                /* Transaction is Not Valid */
                tokenDifferenceDecentralized = undefined;
            }
            /* Verify if User Address is Valid */
            let isValidAddress = (new String(user.address).toLowerCase() == new String(transaction_params.tokensTransferedTo).toLowerCase())
            
            
            let res = {
                withdrawExists,
                user_in_app,
                withdraw_id : params.withdraw_id,
                transactionIsValid,
                //hashWithdrawingPositionOpen,
                isValidAddress,
                currentAPIBalance,
                currentOpenWithdrawingAmount,
                casinoContract : casinoContract,
                wasAlreadyAdded,
                transactionHash : params.transactionHash,
                currencyTicker      : app.currencyTicker,
                creationDate        : new Date(),
                app,
                user,
                amount : -Math.abs(Numbers.toFloat(tokenDifferenceDecentralized)),
                withdrawAddress : user.address
            }
            
            return res;
        }catch(err){
            throw err;
        }
    },
    __createApiToken : async (params) => {
		let normalized = {
            ...params,
            bearerToken : Security.prototype.sign(params.id)
        }
		return normalized;
    },
    __getBets : async (params) => {
        let bets = await UsersRepository.prototype.getBets({
            id : params.user,
            size : params.size
        });
		return bets;
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
            const { affiliate } = params;
            let user = await self.save(params);
            /* Register of Affiliate Link */
            let affiliateLinkObject = await (new AffiliateLink({
                userAffiliated : user._id,
                app_id : params.app_id,
                affiliateLink : params.affiliateLink
            })).register();
            /* Add affiliateLink _id */ 
            await UsersRepository.prototype.setAffiliateLink(user._id, affiliateLinkObject._id);
            /* Add Affiliate to Affiliate Link */ 
            await AffiliateLinkRepository.prototype.setAffiliate(affiliateLinkObject._id, affiliate);
            /* Add Afiliate Link to Parent Affiliates */
            let promisesId = affiliateLinkObject.parentAffiliatedLinks.map( async paf => 
                await AffiliateRepository.prototype.addAffiliateLinkChild(paf.affiliate, affiliateLinkObject._id)    
            )

            await Promise.all(promisesId);
            /* Add to App */
            await AppRepository.prototype.addUser(params.app_id, user);
            user = await UsersRepository.prototype.findUserById(user._id);
            return user;
        }catch(err){
            throw err;
        }
	},
	__summary : async (params) => {
		return params;
    },
    __updateWallet : async (params) => {
        try{
            /* Create Deposit Object */
            let deposit = new Deposit({
                user                    : params.user,
                transactionHash         : params.transactionHash,
                creation_timestamp      : params.creationDate,                    
                last_update_timestamp   : params.creationDate,                             
                address                 : params.from,                         // Deposit Address 
                currency                : params.currencyTicker,
                amount                  : params.amount,
            })

            /* Save Deposit Data */
            let depositSaveObject = await deposit.createDeposit();

            /* Update Balance of App */
            await WalletsRepository.prototype.updatePlayBalance(params.wallet, Numbers.toFloat(params.amount));
            
            /* Add Deposit to user */
            await UsersRepository.prototype.addDeposit(params.user_id, depositSaveObject._id);

            return params;
        }catch(err){
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {
        try{
            /* Add Withdraw to user */
            await WithdrawRepository.prototype.finalizeWithdraw(params.withdraw_id, {
                transactionHash         : params.transactionHash,
                last_update_timestamp   : new Date(),                             
                amount                  : Numbers.toFloat(Math.abs(params.amount))
            });
            return params;
        }catch(err){
            throw err;
        }
    },
    __createApiToken : async (params) => {
        let res = await UsersRepository.prototype.createAPIToken(params.id, params.bearerToken);
		return res;
    },
    __getBets : async (params) => {
		return params;
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


class UserLogic extends LogicComponent {
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
				case 'Register' : {
					return library.process.__register(params); break;
				};
				case 'Summary' : {
					return await library.process.__summary(params); break;
                };
                case 'UpdateWallet' : {
					return await library.process.__updateWallet(params); 
                };
                case 'FinalizeWithdraw' : {
					return await library.process.__finalizeWithdraw(params); 
                };
                case 'CreateAPIToken' : {
					return await library.process.__createApiToken(params); break;
                };
                case 'GetBets' : {
					return await library.process.__getBets(params); break;
                };
			}
		}catch(err){
			throw err;
		}
	}

	 /**
	 * Tests user schema.
	 *
	 * @param {user} user
	 * @returns {user} user
	 * @throws {string} On schema.validate failure
	 */

	async testParams(params, action){
	
	}


	async progress(params, progressAction){
		try{			
			switch(progressAction) {
				case 'Login' : {
					return params;
				};
				case 'Register' : {
					return await library.progress.__register(params); 
				};
				case 'Summary' : {
					return await library.progress.__summary(params); 
                };
                case 'UpdateWallet' : {
					return await library.progress.__updateWallet(params); 
                };
                case 'FinalizeWithdraw' : {
					return await library.progress.__finalizeWithdraw(params); 
                };
                case 'CreateAPIToken' : {
					return await library.progress.__createApiToken(params); break;
                };
                case 'GetBets' : {
					return await library.progress.__getBets(params); break;
                };
			}
		}catch(err){
			throw err;
		}
	}
}

// Export Default Module
export default UserLogic;