import {ErrorHandler} from './codes';
import _ from 'lodash';

// Private Use
let libraries;

class ErrorManager {
    constructor(){
        libraries = {
            handler : new ErrorHandler(),
            throwError : function (err){
                throw err; 
            }
        }
    }

    user = function (object, type){
        try{
            switch(type){
                case 'Login' : {  
                    // Verify object (Syntax Error)
                    if(typeof object == 'undefined' || Object.is(object, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                    // Verify User
                    if(typeof object.username == 'undefined' || Object.is(object.username, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
    
                    // Verify Password
                    if(!Object.is(object.verifiedAccount, Boolean) && object.verifiedAccount !== true)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WRONG_PASSWORD));
                    break;
                };
                case 'Register': {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify User is Already Existent
                    if(object.alreadyExists)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.ALREADY_EXISTING_USER));
                    //Verify User Address
                    if(object.isAddressAlreadyRegistered)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_ADDRESS_IS_NOT_VALID));
                    break;
                };
                case 'UpdateWallet': {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify if Address of User is the Same as the Deposit one
                    if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_ADDRESS_IS_NOT_VALID));
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify Deposit was already inserted
                    if(object.wasAlreadyAdded)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.ALREADY_EXISTING_DEPOSIT_TRANSACTION));
                    // Verify if Deposit is Valid
                    if(!object.isValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.DEPOSIT_TRANSACTION_NOT_VALID));
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify if is Already Withdrawing
                    /*if(object.hashWithdrawingPositionOpen){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_MODE_IN_SMART_CONTRACT));}*/
                    // Verify if Transaction is not Valid
                    if(!object.transactionIsValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.TRANSACTION_NOT_VALID));  
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if Address of User is the Same as the Withdraw one
                    if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_ADDRESS_IS_NOT_VALID));               
                    // Verify if transaction was already added
                    if(object.wasAlreadyAdded)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ALREADY_ADDED));
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }
    
    admin = function (admin, type){
        try{
            switch(type){
                case 'Login' : {  
                    // Verify User (Syntax Error)
                    if(typeof admin == 'undefined' || Object.is(admin, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                    // Verify User
                    if(typeof admin.username == 'undefined' || Object.is(admin.username, null)){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT)); break;
                    }
    
                    // Verify Password
                    if(!Object.is(admin.verifiedAccount, Boolean) && admin.verifiedAccount !== true){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WRONG_PASSWORD)); break;
                    }

                    // is 2FA Setup
                    if(admin.has2FASet){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_HAS_2FA)); break;
                    }

                    break;

                };
                case 'Auth' : {
                    break;
                };
                case 'Login2FA' : {  
                    // Verify User (Syntax Error)
                    if(typeof admin == 'undefined' || Object.is(admin, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                    // Verify User
                    if(typeof admin.username == 'undefined' || Object.is(admin.username, null)){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT)); break;
                    }
    
                    // Verify Password
                    if(!Object.is(admin.verifiedAccount, Boolean) && admin.verifiedAccount !== true){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WRONG_PASSWORD)); break;
                    }

                    // is 2FA not Setup
                    if((!admin.has2FASet) || (!admin.secret2FA)){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_HAS_2FA_DEACTIVATED)); break;
                    }

                    // is 2FA Token is Wrong
                    if(!admin.isVerifiedToken2FA){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WRONG_2FA_TOKEN)); break;
                    }
                    break;
                };

                case 'Set2FA' : {  
                    // Verify User (Syntax Error)
                    if(typeof admin == 'undefined' || Object.is(admin, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));

                    // is 2FA Token is Wrong
                    if(!admin.isVerifiedToken2FA){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WRONG_2FA_TOKEN)); break;
                    }
                    break;
                };

                case 'Register': {
                    // Verify User
                    if(typeof admin == 'undefined' || Object.is(admin, null)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT)); break;
                    }
                    // Verify User is Already Existent
                    if(admin.alreadyExists){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.ALREADY_EXISTING_USER)); break;
                    }
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }

    app = function (object, type){
        try{
            switch(type){
                case 'Register' : {  
                    // Verify App (Syntax Error)
                    if(typeof object == 'undefined' || Object.is(object, null)){
                        throw new Error("Syntax Error");            
                    }
                    // Verify if Admin has already an App
                    if(object.hasAppAlready){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_ALREADY_EXISTENT)); break; 
                    }
                    break;
                };
                case 'UpdateWallet': {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT)); break;   
                    }
                    // Verify Deposit was already inserted
                    if(object.wasAlreadyAdded){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.ALREADY_EXISTING_DEPOSIT_TRANSACTION)); break; 
                    }
                    // Verify if Deposit is Valid
                    if(!object.isValid){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.DEPOSIT_TRANSACTION_NOT_VALID)); break;   
                    }
                    // Verify if App is Mentioned
                    if(!object.app || _.isEmpty(object.app)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT)); break;   
                    }
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Verify if is Already Withdrawing
                    /*if(object.hashWithdrawingPositionOpen){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_MODE_IN_SMART_CONTRACT));}*/
                    // Verify if Transaction is not Valid
                    if(!object.transactionIsValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.TRANSACTION_NOT_VALID));  
                    // Verify if Address of User is the Same as the Withdraw one
                    if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_ADDRESS_IS_NOT_VALID));    
                    // Verify if transaction was already added
                    if(object.wasAlreadyAdded)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ALREADY_ADDED));
                    // Verify if App is Mentioned
                    if(!object.app || _.isEmpty(object.app)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT)); break;   
                    }
                    // Verify if transaction was already added
                    if(!object.withdrawExists)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ID_NOT_DEFINED));
                    break;
                }
                case 'EditGameTableLimit' : {
                    // Verify App
                    if(typeof object == 'undefined' || Object.is(object, null))
                       libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Verify if Withdraw Amoount is Positive
                    if(parseFloat(object.tableLimit) <= 0)
                       libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_LIMIT_TABLE))
                    // Verify if Withdraw Amoount is Positive
                    if(!object.isValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.EDIT_TABLE_NOT_VALID));
                    break;
                };
                case 'AddGame' : {
                    // Verify App
                    if(typeof object == 'undefined' || Object.is(object, null))
                       libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Verify if Withdraw Amoount is Positive
                    if(typeof object.app == 'undefined' || Object.is(object.app, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Game is Existent
                    if(typeof object.gameEcosystem == 'undefined' || Object.is(object.gameEcosystem, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.GAME_NOT_EXISTENT));
                    break;
                };
                case 'EditGameEdge' : {
                    // Verify App
                    if(typeof object == 'undefined' || Object.is(object, null))
                       libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Verify if Withdraw Amoount is Positive
                    if( (parseFloat(object.edge) < 0) || (parseFloat(object.edge) > 95))
                       libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_EDGE))
                    // Verify if Withdraw Amoount is Positive
                    if(!object.isValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.EDIT_EDGE_NOT_VALID));
                    break;
                };
            }
        }catch(err){
            throw err
        }
     
    }

    game = function (game, type){
        try{
            switch(type){
                case 'Register' : {  
    
                    // Verify Game (Syntax Error)
                    if(typeof game == 'undefined' || Object.is(game, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    break;
                }
            }
        }catch(err){
            throw err
        }
     
    }

    resultSpace = function (object, type){
        try{
            switch(type){
                case 'Register' : {  
                    // Verify ResultSpace (Syntax Error)
                    if(typeof object == 'undefined' || Object.is(object, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }

    deposit = function (deposit, type){
        try{
            switch(type){
                case 'ConfirmDeposit' : {  
                    // Verify App (Syntax Error)
                    if(typeof deposit == 'undefined' || Object.is(deposit, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // TO DO : Add Security , verify if it was already confirmed
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }

    withdraw = function (object, type){
        try{
            switch(type){
                case 'ConfirmWithdraw' : {  
                    // Verify App (Syntax Error)
                    if(typeof object == 'undefined' || Object.is(object, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // TO DO : Add Security , verify if it was already confirmed
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }
    
    wallet = function (wallet, type){
        try{
            switch(type){
                case 'Register' : {  
                    // Verify wallet (Syntax Error)
                    if(typeof wallet == 'undefined' || Object.is(wallet, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                }
            }
        }catch(err){
            throw err
        }
    }

    security = function (security, type){
        try{
            switch(type){
                case 'Register' : {  
                    // Verify wallet (Syntax Error)
                    if(typeof security == 'undefined' || Object.is(security, null))
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
    
                }
            }
        }catch(err){
            throw err
        }
    }

    bet = function (bet, type){
        try{
            switch(type){
                case 'Auto' : {  
                    // Verify App (Syntax Error)
                    if(typeof bet == 'undefined' || Object.is(bet, null)){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                        break;
                    }
                    /* Verify if betAmount is less or equal than 0 */
                    if(bet.betAmount <= 0){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_BET));
                        break;
                    }
                    /* Verify if possibleWinAmount is less or equal than 0 */
                    if(bet.possibleWinAmount <= 0){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_BET));
                        break;
                    }
                    /* Verify if appPlayBalance is less than 0 */
                    if(bet.appPlayBalance < 0){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_BET));
                        break;
                    }
                    /* Verify if User has Balance  */
                    if(bet.playBalance < bet.betAmount){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.INSUFFICIENT_FUNDS));
                    }
                    // Verify App (Syntax Error)
                    if(bet.appPlayBalance < bet.possibleWinAmount){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.INSUFFICIENT_LIQUIDITY));
                    }
                    // Verify User is in App
                    if(!bet.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if Result Space is low
                    if(bet.result.length < 1){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_BET));
                    }
                    // Table Limit Suprassed
                    if(parseFloat(bet.possibleWinAmount) > parseFloat(bet.tableLimit)){
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.TABLE_LIMIT_SUPRASSED));                
                    }
                    if(bet.isUserWithdrawingAPI || bet.isAppWithdrawingAPI)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_IN_PLACE));
                    break;
                }
            }
        }catch(err){
            throw err
        }
    }
}

export default ErrorManager;


const throwError = (typeError='UNKNOWN') => {
    throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS[typeError]));
}

export {
    throwError
}