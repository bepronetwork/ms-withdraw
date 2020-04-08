


const _ = require('lodash');
import { ErrorManager } from '../controllers/Errors';
import { GamesRepository, UsersRepository, WalletsRepository } from '../db/repos';
import LogicComponent from './logicComponent';
import { CryptographySingleton } from '../controllers/Helpers';
import CasinoLogicSingleton from './utils/casino';

import Numbers from './services/numbers';
import { BetResultSpace } from '../models';
import { throwError } from '../controllers/Errors/ErrorManager';

 
let error = new ErrorManager();


// Private fields
let self; // eslint-disable-line no-unused-vars
let library;

let __private = {};


// TO DO : Create Different Type of Resolving Actions for Casino
const betResolvingActions = {
    auto : (params) => {
		var hmca_hash, outcome, isWon, outcomeResultSpace;

		/**
		 * @function HMCA SHA512 Result Output
		 */

		hmca_hash = CryptographySingleton.generateRandomResult(params.serverSeed, params.clientSeed, params.nonce),
		outcome = CryptographySingleton.hexToInt(hmca_hash) 
		 
		outcomeResultSpace 	= CasinoLogicSingleton.fromOutcometoResultSpace(outcome, params.resultSpace)

        var { winAmount, isWon, totalBetAmount } =  CasinoLogicSingleton.calculateWinAmountWithOutcome({
            userResultSpace : params.result,
            resultSpace : params.resultSpace,
            outcomeResultSpace : outcomeResultSpace,
            houseEdge : params.edge,
            game : params.gameMetaName
        });
        
        return {winAmount, outcomeResultSpace, isWon, outcome, totalBetAmount, hmca_hash};
    },
    oracled : (params) => {
        let hmca_hash, outcome, isWon, outcomeResultSpace;

		/**
		 * @function HMCA SHA512 Result Output
		 */

		hmca_hash = CryptographySingleton.generateRandomResult(params.serverSeed, params.clientSeed, params.nonce),
		 
		outcomeResultSpace 	= params.outcome;
		isWon 	       		= CasinoLogicSingleton.isWon(outcomeResultSpace, params.result);

        var { winAmount : possibleWinAmount } =  CasinoLogicSingleton.calculateMaxWinAmount({
            userResultSpace : params.result, 
			resultSpace : params.resultSpace,
            houseEdge : params.edge,
            gameMetaName : params.gameMetaName
        });

        let winAmount = isWon ? possibleWinAmount : 0;
        
        return {...params, winAmount, outcomeResultSpace, isWon, possibleWinAmount, outcome, hmca_hash};

    }
}
/**
 * Login logic.
 *
 * @class
 * @memberof logic
 * @param {function} params - Function Params
 **/

  
const processActions = {
    __auto : async (params) => {
        try{
            let game = await GamesRepository.prototype.findGameById(params.game);
            let user = await UsersRepository.prototype.findUserById(params.user);
            let app = user.app_id;
            // Tests
            if(!app || (app._id != params.app)){throwError('APP_NOT_EXISTENT')}
            var user_in_app = (app._id == params.app);
            var delta;

            if(!game){throwError('GAME_NOT_EXISTENT')}
            if(!user){throwError('USER_NOT_EXISTENT')}
            if(params.nonce <= 10340){throwError('BAD_NONCE')}

            let appPlayBalance = Numbers.toFloat(app.wallet.playBalance);
            let userBalance = Numbers.toFloat(user.wallet.playBalance);
            let resultBetted = CasinoLogicSingleton.normalizeBet(params.result);
            var serverSeed = CryptographySingleton.generateSeed();
            var clientSeed = CryptographySingleton.generateSeed();
            /* Verify if Withdrawing Mode is ON - User */
            let isUserWithdrawingAPI = user.isWithdrawing;
            /* Verify if Withdrawing Mode is ON - App */
            let isAppWithdrawingAPI = app.isWithdrawing;

            /* Get Possible Win Balance for Bet */ 
            let { totalBetAmount, possibleWinAmount, fee } = CasinoLogicSingleton.calculateMaxWinAmount({
                userResultSpace : resultBetted,
                resultSpace : game.resultSpace,
                houseEdge : game.edge,
                game : game.metaName
            }); 

            if(userBalance < totalBetAmount){throwError('INSUFFICIENT_FUNDS')}
            /* Get Bet Result */
            let { isWon,  winAmount, outcomeResultSpace} = betResolvingActions.auto({
                serverSeed : serverSeed,
                clientSeed : clientSeed,
                nonce : params.nonce,
                resultSpace : game.resultSpace,
                result : resultBetted,
                gameMetaName : game.metaName,
                betAmount : totalBetAmount,
                edge : game.edge
            });

            if(isWon){
                delta = Numbers.toFloat(Math.abs(winAmount) - Math.abs(totalBetAmount));
            }else{
                delta = Numbers.toFloat(-Math.abs(totalBetAmount));
            }

            var possibleWinBalance = Numbers.toFloat(possibleWinAmount + userBalance);            
            // If Casino Existent
            //var jackpotGame = app.games.find(game => game.metaName === 'jackpot_auto')
            //let hasJackpot = jackpotGame ? true : false;            
            let normalized = {
                user_in_app,
                isUserWithdrawingAPI,
                isAppWithdrawingAPI,
                delta,
                tableLimit                      :   game.tableLimit,
                user                            :   user._id, 				    
                app                             :   app._id,
                outcomeResultSpace              :   outcomeResultSpace,
                isWon                           :   isWon,
                game                            :   game._id,
                betSystem                       :   game.betSystem,
                appWallet 			            :   app.wallet._id, 
                wallet				            :   user.wallet._id,
                appPlayBalance		:   appPlayBalance, 
                playBalance         :   userBalance,
                possibleWinAmount,
                possibleWinBalance,
                winAmount,
                betAmount           :   totalBetAmount,
                fee,
                result         		:   resultBetted,			   
                timestamp           :   new Date(),
                nonce               :   params.nonce,
                clientSeed          :   clientSeed,
                serverHashedSeed    :   CryptographySingleton.hashSeed(serverSeed),
                serverSeed          :   serverSeed
            }

            return normalized;
        }catch(err){
            throw err;
        }
    },
	__register : async (params) => {

	},
	__resolve : async (params) => {
	
    },
    __playAutoJackpot : async (params) => {
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
    __auto : async (params) => {

        /* Save all ResultSpaces */
        let dependentObjects = Object.keys(params.result).map( async key => {
            let resultSpaceObject = new BetResultSpace(params.result[key]);
            return await resultSpaceObject.register();
        });
        let betResultSpacesIds = await Promise.all(dependentObjects);
        // Generate new Params Setup

        params = {
            ...params,
            result : betResultSpacesIds,
            isResolved : true
        }
        /* Save Bet */
        let bet = await self.save(params);

		/* Update PlayBalance */
        await WalletsRepository.prototype.updatePlayBalance(params.wallet, params.delta);
        /* Update App PlayBalance */
        await WalletsRepository.prototype.updatePlayBalance(params.appWallet, -params.delta);
        
		/* Add Bet to User Profile */
		await UsersRepository.prototype.addBet(params.user, bet);
		/* Add Bet to Event Profile */
        await GamesRepository.prototype.addBet(params.game, bet);

        let res = {
            bet,
            ...params
        }
		return res;
	},
	__register : async (params) => {
      
	},
	__resolve : async (params) => {
    
    },
    __playAutoJackpot : async (params) => {
        return params;
	}
}
/**
 * Main Bet logic.
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
 * @property {Bet_model} model
 * @property {Bet_schema} schema
 * @returns {setImmediate} error, this
 * @todo Add description for the params
 */


class BetLogic extends LogicComponent{
	constructor(scope) {
		super(scope);
		self = this;
		__private = {
			db : scope.db,
			__normalizedSelf : null
		};

		library = {
			process  : processActions,
			progress : progressActions
		}
    }


    /**
	 * Validates Bet schema.
	 *
	 * @param {Bet} Bet
	 * @returns {Bet} Bet
	 * @throws {string} On schema.validate failure
	 */
	async objectNormalize(params, processAction) {
		try{			
			switch(processAction) {
                case 'Auto' : {
					return await library.process.__auto(params); break;
				};
				case 'Register' : {
					return await library.process.__register(params); break;
				};
				case 'Resolve' : {
					return await library.process.__resolve(params); break;
                };
                case 'PlayAutoJackpot' : {
					return await library.process.__playAutoJackpot(params); break;
				};
			}
		}catch(err){
			throw err;
		}
	}

	 /**
	 * Tests Bet schema.
	 *
	 * @param {Bet} Bet
	 * @returns {Bet} Bet
	 * @throws {string} On schema.validate failure
	 */

	testParams(params, action){
		
	}

	async progress(params, progressAction){
		try{			
			switch(progressAction) {
                case 'Auto' : {
					return await library.progress.__auto(params); break;
				};
				case 'Register' : {
					return await library.progress.__register(params); break;
				};
				case 'Resolve' : {
					return await library.progress.__resolve(params); break;
                };
                case 'PlayAutoJackpot' : {
					return await library.progress.__playAutoJackpot(params); break;
				};
			}
		}catch(report){
			throw `Failed to validate user schema: User \n See Stack Trace : ${report}`;
		}
	}
}

export default BetLogic;

