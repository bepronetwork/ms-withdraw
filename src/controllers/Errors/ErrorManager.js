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
   
    app = function (object, type){
        try{
            
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