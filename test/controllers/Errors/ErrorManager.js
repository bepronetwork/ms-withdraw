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
            
        }catch(err){
            throw err
        }
    }
    
    admin = function (admin, type){
        try{
            
        }catch(err){
            throw err
        }
    }

    app = function (object, type){
        try{
            
        }catch(err){
            throw err
        }
     
    }

    game = function (game, type){
        try{
            
        }catch(err){
            throw err
        }
     
    }

    resultSpace = function (object, type){
        try{
            
        }catch(err){
            throw err
        }
    }

    deposit = function (deposit, type){
        try{
            
        }catch(err){
            throw err
        }
    }

    withdraw = function (object, type){
        try{
            
        }catch(err){
            throw err
        }
    }
    
    wallet = function (wallet, type){
        try{
            
        }catch(err){
            throw err
        }
    }

    security = function (security, type){
        try{
            
        }catch(err){
            throw err
        }
    }

    bet = function (bet, type){
        try{
           
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