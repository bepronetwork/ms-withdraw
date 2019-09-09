import { PRIVATE_KEY, PUBLIC_KEY } from '../../../src/config';

var bcrypt = require('bcrypt');
var twoFactor = require('node-2fa');
const jwt = require('jsonwebtoken');
const fs   = require('fs');
var SALT_ROUNDS = 10;

// use 'utf8' to get string instead of byte array  (512 bit key)
var privateKEY  = new String("-----BEGIN RSA PRIVATE KEY-----\n" + PRIVATE_KEY + "\n-----END RSA PRIVATE KEY-----").trim();;
var publicKEY  =  new String("-----BEGIN PUBLIC KEY-----\n" + PUBLIC_KEY + "\n-----END PUBLIC KEY-----").trim();


class Security {

    constructor(password){
        this.state = {
            password : password
        }
    }

    hash(){
        //Hash Password
        try{
            return this.hashPassword(this.state.password);
        }catch(error){
            throw error; 
        } 
    }

    hashPassword = (password) => {
        try{
            return bcrypt.hashSync(password, SALT_ROUNDS);
        }catch(error){
            throw error;
        }
        
    }

    sign(payload){
        try{
            let token = jwt.sign({ id : 'Auth/' + payload }, privateKEY, { algorithm: 'RS256' });
            return token;
        }catch(err){
            throw err;
        }
    };

    verify({token, payload, id}){
        try{
            let response = jwt.verify(token, publicKEY, { algorithm: 'RS256' });
            if('Auth/' + payload.id != response.id || payload.id != id){ throw err;};
            return true;
        }catch (err){
            return false;
        }
    };


    decode(token){
        return jwt.decode(token, {complete: true});
        //returns null if token is invalid
    }


    unhashPassword(password, hashPassword){
          // Verifying a hash 
        try{
            return bcrypt.compareSync(password, hashPassword);
        }catch(error){
            throw error;
        }
    }

    generateSecret2FA({name='BetProtocol', account_id}){
        try{
            return (twoFactor.generateSecret({name: name, account: account_id})).secret;
        }catch(error){
            throw error;
        }
    }


    generateToken2FA(secret){
        try{
            return (twoFactor.generateToken(secret)).token
        }catch(error){
            throw error;
        }
    }

    isVerifiedToken2FA({secret, token}){
        try{
            let response = twoFactor.verifyToken(secret, token);
            if(!response){ return false};
            return(response.delta == 0);
        }catch(error){
            throw error;
        }
    }
}

export default Security;