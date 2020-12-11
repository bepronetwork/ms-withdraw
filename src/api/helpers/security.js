import MiddlewareSingleton from "./middleware";
import { AdminsRepository, PermissionRepository } from "../../db/repos";
import * as crypto from "crypto";

class Security{

    constructor() {}

    checkPermission = async (permissions = [], admin) => {
        if(permissions.includes("all")) {
            return true;
        }
        let adminObject         = await AdminsRepository.prototype.findAdminById(admin);
        let permissionsObject   = await PermissionRepository.prototype.findById(adminObject.permission);
        for(let permission of permissions) {
            if(permissionsObject[permission]) {
                return true;
            }
        }
        throw new Error();
    };

    checkWebhook = (request, key) => {
        try {
            console.log(">>>>>>> checkWebhook");
            console.log(request.headers["X-Sha2-Signature"]);
            const hmac = crypto.createHmac("SHA256", key);
            const computedHashSignature = hmac.update(request.body).digest("hex");
            const expectedHashSignature = request.headers["X-Sha2-Signature"];
            console.log(`${computedHashSignature} !== ${expectedHashSignature}`);
            if (computedHashSignature !== expectedHashSignature) {
                throw new Error("Webhook hash signature mismatch");
            }
        } catch(err) {
            console.log("error 1", err);
            throw err;
        }
    }

    verify = ({type, req, permissions=[]}) => {
        try{
            let id = req.body[type];
            if(type=="admin") {
                this.checkPermission(permissions, id);
            }
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