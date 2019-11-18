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
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.NEGATIVE_AMOUNT))
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if User does not have enough balance
                    if(!object.hasEnoughBalance){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE));
                    }                    
                    // Verify if Minimum Withdraw was passed
                    if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    }
                    // Verify if Address of User is the Same as the Withdraw one
                    /*if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_ADDRESS_IS_NOT_VALID));*/
                    // Verify if is Already Withdrawing in SmartContract
                    /*if(object.isAlreadyWithdrawingSmartContract)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_MODE_IN_SMART_CONTRACT)); */
                    // Verify if is Amount is Verified
                    /*if(!object.isAmountVerified)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_WITHDRAW_AMOUNT_SIGNED));*/
                    break;
                };               
                case 'RequestAffiliateWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    // Verify if Withdraw Amount is Positive
                    if(parseFloat(object.amount) <= 0)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.NEGATIVE_AMOUNT))
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));
                    // Verify if User does not have enough balance
                    if(!object.hasEnoughBalance){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE));
                    }                    
                    // Verify if Minimum Withdraw was passed
                    if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    }
                    // Verify if Address of User is the Same as the Withdraw one
                    /*if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_ADDRESS_IS_NOT_VALID));*/
                    // Verify if is Already Withdrawing in SmartContract
                    /*if(object.isAlreadyWithdrawingSmartContract)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_MODE_IN_SMART_CONTRACT)); */
                    // Verify if is Amount is Verified
                    /*if(!object.isAmountVerified)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_WITHDRAW_AMOUNT_SIGNED));*/
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT));
                    if(!object.transactionIsValid)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.TRANSACTION_NOT_VALID));  
                    // Verify User is in App
                    if(!object.user_in_app)
                        throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.USER_NOT_EXISTENT_IN_APP));      
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
                    // Verify if App does not have enough balance
                    if(!object.hasEnoughBalance)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_NOT_ENOUGH_BALANCE))
                    // Verify if Address of User is the Same as the Withdraw one
                    /*if(!object.isValidAddress)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_ADDRESS_IS_NOT_VALID));*/
                    // Verify if is Already Withdrawing in SmartContract
                    /*if(object.isAlreadyWithdrawingSmartContract)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.WITHDRAW_MODE_IN_SMART_CONTRACT));
                    */
                    // Verify if App is Mentioned
                    if(!object.app || _.isEmpty(object.app)){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT)); break;   
                    }
                    // Verify if Minimum Withdraw was passed
                    if(parseFloat(object.amount) < MIN_WITHDRAW){
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.MIN_WITHDRAW_NOT_PASSED));
                    }
                    // Verify if is Amount is Verified
                    /*if(!object.isAmountVerified)
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.BAD_WITHDRAW_AMOUNT_SIGNED));*/
                    break;
                };
                case 'FinalizeWithdraw' : {
                    // Verify User
                    if(typeof object == 'undefined' || Object.is(object, null))
                        libraries.throwError(libraries.handler.getError(libraries.handler.KEYS.APP_NOT_EXISTENT));
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
}

export default ErrorManager;


const throwError = (typeError='UNKNOWN') => {
    throw libraries.throwError(libraries.handler.getError(libraries.handler.KEYS[typeError]));
}

export {
    throwError
}