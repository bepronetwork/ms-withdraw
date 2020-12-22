import { AdminsRepository, PermissionRepository } from "../../db/repos";
import * as crypto from "crypto";
const axios = require('axios');
import {MS_MASTER_URL, PRIVATE_KEY} from "../../config";

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
            const hmac = crypto.createHmac("SHA256", key);
            const computedHashSignature = hmac.update(JSON.stringify(request.body)).digest("hex");
            const expectedHashSignature = request.headers["x-sha2-signature"];
            if (computedHashSignature !== expectedHashSignature) {
                throw new Error("Webhook hash signature mismatch");
            }
        } catch(err) {
            throw err;
        }
    }

    checkServeToServe = (request, key) => {
        try {
            const hmac = crypto.createHmac("SHA256", key);
            const computedHashSignature = hmac.update(JSON.stringify(request.body)).digest("hex");
            const expectedHashSignature = request.headers["x-sha2-signature"];
            console.log("computedHashSignature:: ", computedHashSignature)
            console.log("expectedHashSignature:: ", expectedHashSignature)
            if (computedHashSignature !== expectedHashSignature) {
                throw new Error("Webhook hash signature mismatch");
            }
        } catch(err) {
            throw err;
        }
    }

    verifyServeToServe = (req) => {
        try {
            this.checkServeToServe(req, PRIVATE_KEY);
        } catch(err) {
            throw {
                code : 304,
                messsage : 'Forbidden Access'
            }
        }
    }

    verify = (req) => {
        let header = req.headers;
        let body   = req.body;
        return new Promise((resolve, reject)=>{
            var data = JSON.stringify(body);

            var config = {
            method: 'post',
            url: `${MS_MASTER_URL}/api/users/auth`,
            headers: {
                'Authorization': header.authorization,
                'payload': header.payload,
                'Content-Type': 'application/json'
            },
            data : data
            };

            axios(config)
            .then(function (response) {
                console.log(response);
                resolve(response);
            })
            .catch(function (error) {
                console.log(error);
                throw {
                    code : 304,
                    messsage : 'Forbidden Access'
                }
            });
        });
    }
}

let SecuritySingleton = new Security();

export default SecuritySingleton;