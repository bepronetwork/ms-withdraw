import _ from 'lodash';
import { ErrorManager } from '../controllers/Errors';
import { AppRepository,  WalletsRepository,  UsersRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { Withdraw } from '../models';
import CasinoContract from './eth/CasinoContract';
import { globals } from '../Globals';
import Numbers from './services/numbers';
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
    __requestWithdraw : async (params) => {
        var app;
        try{
            if(params.tokenAmount <= 0){throwError('INVALID_AMOUNT')}

            /* Get App Id */
            app = await AppRepository.prototype.findAppById(params.app);
            if(!app){throwError('APP_NOT_EXISTENT')}

            /* Create Casino Contract Instance */
            let casinoContract = new CasinoContract({
                web3                : globals.web3,
                account             : globals.getManagerAccount(),
                contractAddress     : app.platformAddress,
                tokenAddress        : app.platformTokenAddress
            })

            let amount = Numbers.toFloat(Math.abs(params.tokenAmount));
            let currentBalance = Numbers.toFloat(app.wallet.playBalance);

            /* Get All Users Balance */
            let allUsersBalance = (await UsersRepository.prototype.getAllUsersBalance({app : app._id})).balance;
            if(typeof allUsersBalance != 'number'){throwError('UNKNOWN')}
            /* Verify if User new Balance is the same as requested to Update */
            
            /* Verify if App has Enough Balance for Withdraw */
            let hasEnoughBalance = (amount <= Numbers.toFloat(app.wallet.playBalance));

            let res = {
                allUsersBalance,
                hasEnoughBalance,
                withdrawAddress : app.ownerAddress,
                currencyTicker : app.currencyTicker,
                amount : amount,
                playBalanceDelta : Numbers.toFloat(-Math.abs(amount)),
                casinoContract : casinoContract,
                address     : app.ownerAddress,
                app         : app,
                decimals    : app.decimals,
                nonce       : params.nonce,
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
            creation_timestamp      : new Date(),                    
            address                 : params.withdrawAddress,                         // Deposit Address 
            currency                : params.currencyTicker,
            amount                  : params.amount,
            nonce                   : params.nonce,
        })

        /* Save Deposit Data */
        var withdrawSaveObject = await withdraw.createWithdraw();

        try{
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.app.wallet, params.playBalanceDelta);

            /* Add Withdraw to App */
            await AppRepository.prototype.addWithdraw(params.app._id, withdrawSaveObject._id);

            /* Update All Users Balance in Smart-Contract */
            await params.casinoContract.approveOwnerWithdrawal({
                address             : params.withdrawAddress,
                amount              : Numbers.toFloat(params.amount),
                newPlayersBalance   : Numbers.toFloat(params.allUsersBalance),
                decimals            : params.decimals
            });
            console.log("Withdraw Done")
            return params;

        }catch(err){
            console.log(err);
            /* Update App Wallet in the Platform */
            await WalletsRepository.prototype.updatePlayBalance(params.app.wallet, -params.playBalanceDelta);
            throwError('ERROR_TRANSACTION')
        }
    }
}

/**
 * Main App logic.
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
 * @property {App_model} model
 * @property {App_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class AppLogic extends LogicComponent{
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
	 * Validates App schema.
	 *
	 * @param {App} App
	 * @returns {App} App
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
                case 'RequestWithdraw' : {
					return await library.process.__requestWithdraw(params); 
                };
            }
		}catch(error){
			throw error
		}
	}

	 /**
	 * Tests App schema.
	 *
	 * @param {App} App
	 * @returns {App} App
	 * @throws {string} On schema.validate failure
	 */

	async testParams(params, action){
		try{
			error.app(params, action);
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
            }
		}catch(error){
			throw error;
		}
	}
}

// Export Default Module
export default AppLogic;

