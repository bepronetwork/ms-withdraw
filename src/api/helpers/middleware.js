import { PUBLIC_KEY, PRIVATE_KEY } from '../../config';

const jwt   = require('jsonwebtoken');
// use 'utf8' to get string instead of byte array  (512 bit key)
var privateKEY  = new String("-----BEGIN RSA PRIVATE KEY-----\n" + PRIVATE_KEY + "\n-----END RSA PRIVATE KEY-----").trim();;
var publicKEY  =  new String("-----BEGIN PUBLIC KEY-----\n" + PUBLIC_KEY + "\n-----END PUBLIC KEY-----").trim();

class Middleware{
    constructor(){}


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

    respond(res, data){
        try{
            res.json({
                data : {
                    status : 200,
                    message : data
                }
            });
        }catch(err){
            this.respondError(res, err)
        }
    }

    respondError(res, err){
        try{
            // Unknown Error
            if(!err.code){throw err}
            res.json({
                data : {
                    status : err.code,
                    message : err.message
                }
            });
        }catch(err){
            console.error(err)
            res.json({
                data : {
                    status : 404,
                    message : 'Internal Server Error'
                }
            });
        }
    }
}

let MiddlewareSingleton = new Middleware();

export default MiddlewareSingleton;