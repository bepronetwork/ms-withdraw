require('dotenv').config();
const config = require('./config.json');
import { changeAllStringsInObjectRecursive } from '../helpers/object.js';
export const PORT = process.env.PORT;

/* ENV */

export const DB_USER =  process.env.DB_USER;

export const LIMIT =  process.env.LIMIT || 1;

export const RATE =  process.env.RATE || 100;

export const DB_PASSWORD =  process.env.DB_PASSWORD;

export const APP_MGMT_PRIVATE_KEY =  process.env.APP_MGMT_PRIVATE_KEY;

export const ETH_TEST_NET = process.env.ETH_NET; 

export const MONGO_ID = process.env.MONGO_ID; 

export const INFURA_KEY = process.env.INFURA_KEY; 

export const ETH_NET_NAME = process.env.ETH_NET_NAME; 

export const ETH_RPC_URL = process.env.ETH_RPC_URL;

export const PUBLIC_KEY = process.env.PUBLIC_KEY;

export const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const MIN_WITHDRAW = parseFloat(process.env.MIN_WITHDRAW);

export const MS_MASTER_URL = process.env.MS_MASTER_URL;

export const BITGO_ACCESS_TOKEN = process.env.BITGO_KEY;

export const BITGO_ENTERPRISE_ID = process.env.BITGO_ENTERPRISE_ID;

export const QUOTA_GUARD_URL = process.env.QUOTA_GUARD_URL;

export const IS_DEVELOPMENT = process.env.ENV == 'development';

export const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;

export const SENDINBLUE_EMAIL_TO = process.env.SENDINBLUE_EMAIL_TO;

export const ENV = process.env.ENV;

/* Variables */

var ETH_NETWORK = config.eth;

var DB_MONGO = config.mongo;

/**
 * @function SET_ENV
 */


DB_MONGO = {
    "connection_string" : process.env.MONGO_URL,
    "dbs" : {
        "main" : process.env.MONGO_MAIN,
        "ecosystem" : process.env.MONGO_ECOSYSTEM,
        "redis" : process.env.MONGO_REDIS
    }
};


if(ETH_RPC_URL){
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'APP_MGMT_PRIVATE_KEY', APP_MGMT_PRIVATE_KEY);
    ETH_NETWORK.url = ETH_RPC_URL;
}else{
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'APP_MGMT_PRIVATE_KEY', APP_MGMT_PRIVATE_KEY);
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'ETH_NET_NAME', ETH_NET_NAME);
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'INFURA_KEY', INFURA_KEY);
}

export {
    ETH_NETWORK,
    DB_MONGO
}