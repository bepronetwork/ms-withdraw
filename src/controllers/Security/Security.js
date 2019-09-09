var bcrypt = require('bcrypt');
var twoFactor = require('node-2fa');
var SALT_ROUNDS = 10;

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