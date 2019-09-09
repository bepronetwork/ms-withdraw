import MiddlewareSingleton from "./middleware";

class Security{

    constructor(){}

    verify = ({type, req}) => {
        try{
            let id = req.body[type];
            var bearerHeader = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
            var payload = JSON.parse(req.headers['payload']); // Payload with Id
            if(typeof bearerHeader !== 'undefined'){
                // Split the Space
                const bearer = bearerHeader.split(' ');
                // Get Token From Array
                const bearerToken = bearer[1];
                let verified = MiddlewareSingleton.verify({token : bearerToken, payload, id});
                if(!verified){throw new Error()}
                
                return verified;
            } else { 
                throw new Error();
            }
        }catch(err){
            throw {
                code : 304,
                messsage : 'Forbidden Access'
            }
        }
    }

}

let SecuritySingleton = new Security();

export default SecuritySingleton;