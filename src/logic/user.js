


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import LogicComponent from './logicComponent';
import { UsersRepository, AppRepository, WalletsRepository, WithdrawRepository } from '../db/repos';
import Numbers from './services/numbers';
import { Withdraw } from '../models';
import CasinoContract from './eth/CasinoContract';
import { globals } from '../Globals';
import { throwError } from '../controllers/Errors/ErrorManager';
import { verifytransactionHashWithdrawUser } from './services/services';
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

    __requestWithdraw : async (params) => {
        var user;
        try{
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}
            /* Get User Id */
            user = await UsersRepository.prototype.findUserById(params.user);
            var app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            
            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                account             : globals.getManagerAccount(),
                contractAddress     : app.platformAddress,
                tokenAddress        : app.platformTokenAddress
            })
            
            let amount = Numbers.toFloat(Math.abs(params.tokenAmount));

            /* Verify if Withdraw position is already opened in the system */
            let amountApprovedForWithdrawal = await casinoContract.getApprovedWithdrawAmount({
                address : user.address, decimals : app.decimals
            })
            let isWithdrawingSmartContract = (amountApprovedForWithdrawal) > 0 ? true : false;
            /* User Current Balance */
            let currentBalance = Numbers.toFloat(user.wallet.playBalance);
            
            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);

            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            let res = {
                hasEnoughBalance,
                user_in_app,
                currencyTicker      : app.currencyTicker,
                withdrawAddress : user.address,
                amount,
                playBalanceDelta : Numbers.toFloat(-Math.abs(amount)),
                casinoContract : casinoContract,
                user : user,
                address     : user.address,
                app : app,
                decimals : app.decimals,
                nonce : params.nonce,
                amountApprovedForWithdrawal,
                isAlreadyWithdrawingAPI : user.isWithdrawing,
                isAlreadyWithdrawingSmartContract : isWithdrawingSmartContract,
            }
            return res;
        }catch(err){ 
            throw err;
        }
    },
    __requestAffiliateWithdraw : async (params) => {
        var user;
        try{
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}
            /* Get User Id */
            user = await UsersRepository.prototype.findUserById(params.user);
            let app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            
            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                account             : globals.getManagerAccount(),
                contractAddress     : app.platformAddress,
                tokenAddress        : app.platformTokenAddress
            })
            
            let amount = Numbers.toFloat(Math.abs(params.tokenAmount));

            /* Verify if Withdraw position is already opened in the system */
            let amountApprovedForWithdrawal = await casinoContract.getApprovedWithdrawAmount({
                address : user.address, decimals : app.decimals
            })
            let isWithdrawingSmartContract = (amountApprovedForWithdrawal) > 0 ? true : false;

            /* User Current Balance */
            let currentBalance = Numbers.toFloat(user.affiliate.wallet.playBalance);
            /* Verify if User has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= currentBalance);
            /* Verify if User is in App */
            let user_in_app = (app.users.findIndex(x => (x._id.toString() == user._id.toString())) > -1);

            /* Verify if Withdraw position is already opened in the Smart-Contract */
            let res = {
                hasEnoughBalance,
                user_in_app,
                currencyTicker      : app.currencyTicker,
                withdrawAddress : user.address,
                amount,
                playBalanceDelta : Numbers.toFloat(-Math.abs(amount)),
                casinoContract : casinoContract,
                user : user,
                address     : user.address,
                app : app,
                decimals : app.decimals,
                nonce : params.nonce,
                amountApprovedForWithdrawal,
                isAlreadyWithdrawingAPI : user.isWithdrawing,
                isAlreadyWithdrawingSmartContract : isWithdrawingSmartContract,
            }
            return res;
        }catch(err){ 
            throw err;
        }
    },
    __finalizeWithdraw : async (params) => {
        try{
            var params_input = params;
            var transaction_params = { }, tokenAmount;

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
            let withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionHash(params_input.transactionHash);
            let user_withdraw = await WithdrawRepository.prototype.getWithdrawByTransactionHash(params_input.transactionHash, {user : user._id});

            let wasAlreadyAddedTx = withdraw ? true : false;
            let wasAlreadyAddedTxToUser = user_withdraw ? true : false;

            withdraw = await WithdrawRepository.prototype.findWithdrawById(params_input.withdraw_id);
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
                'eth', params_input.transactionHash, app.platformAddress, user.address
            )

            let transactionIsValid = transaction_params.isValid;

            if(transactionIsValid){
                /* Transaction is Valid */
                tokenAmount = Numbers.toFloat(Numbers.fromDecimals(transaction_params.tokenAmount, app.decimals));
            }else{
                /* Transaction is Not Valid */
                tokenAmount = undefined;
            }
            
            /* Verify if was Already Added or Invalid */
            let wasAlreadyAdded = (wasAlreadyAddedTx && wasAlreadyAddedTxToUser && transactionIsValid);

            let res = {
                withdrawExists,
                user_in_app,
                withdraw_id : params.withdraw_id,
                transactionIsValid,
                //hashWithdrawingPositionOpen,
                currentAPIBalance,
                //currentOpenWithdrawingAmount,
                casinoContract : casinoContract,
                wasAlreadyAdded,
                transactionHash : params.transactionHash,
                currencyTicker      : app.currencyTicker,
                creationDate        : new Date(),
                app,
                user,
                amount : -Math.abs(Numbers.toFloat(tokenAmount)),
                withdrawAddress : user.address
            }
            
            return res;
        }catch(err){
            throw err;
        }
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
    __requestWithdraw : async (params) => {
         /* Add Withdraw to user */
         var withdraw = new Withdraw({
            app                     : params.app,
            user                    : params.user._id,
            creation_timestamp      : new Date(),                    
            address                 : params.withdrawAddress,                         // Deposit Address 
            currency                : params.currencyTicker,
            amount                  : params.amount,
            nonce                   : params.nonce,
        })
    
        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();
        
        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.user.wallet, params.playBalanceDelta);
        
        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);
        
        return params;
      
    },
    __requestAffiliateWithdraw :  async (params) => {
        /* Add Withdraw to user */
        var withdraw = new Withdraw({
           user                    : params.user._id,
           app                     : params.app,
           creation_timestamp      : new Date(),                    
           address                 : params.withdrawAddress,                         // Deposit Address 
           currency                : params.currencyTicker,
           amount                  : params.amount,
           nonce                   : params.nonce,
           isAffiliate             : true
       })
   
       /* Save Deposit Data */
       var withdrawSaveObject = await withdraw.createWithdraw();

        /* Update User Wallet in the Platform */
        await WalletsRepository.prototype.updatePlayBalance(params.user.affiliate.wallet, params.playBalanceDelta);
        
        /* Add Deposit to user */
        await UsersRepository.prototype.addWithdraw(params.user._id, withdrawSaveObject._id);

        return params;
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
                case 'RequestWithdraw' : {
					return await library.process.__requestWithdraw(params); 
                };
                case 'RequestAffiliateWithdraw' : {
                    return await library.process.__requestAffiliateWithdraw(params); 
                }
                case 'FinalizeWithdraw' : {
					return await library.process.__finalizeWithdraw(params); 
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
		try{
			error.user(params, action);
		}catch(err){
			throw err;
		}
	}


	async progress(params, progressAction){
		try{			
			switch(progressAction) {
                case 'RequestWithdraw' : {
					return await library.progress.__requestWithdraw(params); 
                };
                case 'RequestAffiliateWithdraw' : {
                    return await library.progress.__requestAffiliateWithdraw(params); 
                }
                case 'FinalizeWithdraw' : {
					return await library.progress.__finalizeWithdraw(params); 
                };
			}
		}catch(err){
			throw err;
		}
	}
}

// Export Default Module
export default UserLogic;