import {ErrorHandler} from './codes';
import _ from 'lodash';
import { MIN_WITHDRAW } from '../../config';

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
                case 'RequestWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify if Withdraw Amount is Positive
                    if(parseFloat(object.amount) <= 0)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.NEGATIVE_AMOUNT));
                    // verify amount < max withdraw
                    if(parseFloat(object.amount) > parseFloat(object.max_withdraw))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MAX_WITHDRAW));
                    // verify if amount is less than min withdraw
                    if(parseFloat(object.amount) < parseFloat(object.min_withdraw))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW));
                    // Verify email is confirmed
                    if(!object.emailConfirmed)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.EMAIL_NOT_CONFIRMED));
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if User does not have enough balance
                    if(!object.hasEnoughBalance){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE));
                    }
                    // Verify if Minimum Withdraw was passed
                    /*if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    }      */
                    break;
                };
                case 'RequestAffiliateWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify if Withdraw Amount is Positive
                    if(parseFloat(object.amount) <= 0)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.NEGATIVE_AMOUNT))
                    // verify if amount is less than min withdraw
                    if(parseFloat(object.amount) < parseFloat(object.affiliate_min_withdraw))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW));
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if User does not have enough balance
                    if(!object.hasEnoughBalance){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE));
                    }                    
                    // Verify if Minimum Withdraw was passed
                     /*if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    } */
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));     
                    // Verify if transaction exist
                    if(!object.withdrawExists)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ID_NOT_DEFINED)); 
                    // Verify if transaction was already added
                    if(object.wasAlreadyAdded)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ALREADY_ADDED)); 
                    break;
                }
                case 'CancelWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                        break;
                    }
                    // Verify if Address of User is the Same as the Withdraw one
                    if(object.wasAlreadyAdded){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ALREADY_ADDED));
                        break;
                    }
                    // Verify if App is Mentioned
                    if(!object.app || _.isEmpty(object.app)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                        break;
                    }
                    // Verify if transaction was already added
                    if(!object.withdrawExists){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_ID_NOT_DEFINED));
                        break;
                    }
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
   
    app = function (object, type){
        try{
            switch(type){
                case 'RequestWithdraw' : {
                    // Verify App
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
                    // Verify if Withdraw Amoount is Positive
                    if(parseFloat(object.amount) <= 0)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.NEGATIVE_AMOUNT))
                    // verify amount < max withdraw
                    // if(parseFloat(object.amount) > parseFloat(object.max_withdraw))
                    //     libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MAX_WITHDRAW));
                    // Verify if App does not have enough balance
                    if(!object.hasEnoughBalance)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE))
                    // Verify if App is Mentioned
                    if(!object.app || _.isEmpty(object.app)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT)); break;   
                    }
                    // if(new String(object.app.ownerAddress).toLowerCase() != new String(object.withdrawAddress).toLowerCase()){
                    //     libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_ADDRESS_IS_NOT_VALID));    
                    // }
                    if( !(object.listAddress.map((r)=>r.toLowerCase()).includes(new String(object.withdrawAddress).toLowerCase())) ){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_ADDRESS_IS_NOT_VALID));
                    }
                    // Verify if Minimum Withdraw was passed
                    /*if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    } */
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
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
            }
        }catch(err){
            throw err
        }
    }
    withdraw = function (object, type){
        try{
            switch(type){
                default : {
                    // None
                }
            }
        }catch(err){
            throw err
        }
    }

    address = function (object, type){
        try{
            switch(type){
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

    mailSender = function (object, type){
        try{
            switch(type){
            }
        }catch(err){
            throw err
        }
    }
}

export default ErrorManager;


const throwError = (typeError='UNKNOWN', messageParams = '') => {
    throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS[typeError], messageParams));
}

export {
    throwError
}