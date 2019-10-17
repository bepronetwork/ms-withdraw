require('dotenv').config();
const config = require('./config.json');
import { changeAllStringsInObjectRecursive } from '../helpers/object.js';
export const PORT = process.env.PORT;

/* ENV */

export const DB_USER =  process.env.DB_USER;

export const DB_PASSWORD =  process.env.DB_PASSWORD;

export const APP_MGMT_PRIVATE_KEY =  process.env.APP_MGMT_PRIVATE_KEY;

export const ETH_TEST_NET = process.env.ETH_NET; 

export const MONGO_ID = process.env.MONGO_ID; 

export const INFURA_KEY = process.env.INFURA_KEY; 

export const ETH_NET_NAME = process.env.ETH_NET_NAME; 

export const ETH_RPC_URL = process.env.ETH_RPC_URL;

export const ETH_CONFIRMATION_NEEDED = process.env.CONFIRMATION_NEEDED || 1;

export const PUBLIC_KEY = process.env.PUBLIC_KEY;

export const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const MIN_WITHDRAW = parseFloat(process.env.MIN_WITHDRAW);

/* Variables */

var ETH_NETWORK = config.eth;

var DB_MONGO = config.mongo;

/**
 * @function SET_ENV
 */


DB_MONGO = changeAllStringsInObjectRecursive(DB_MONGO, 'DB_USER', DB_USER);

DB_MONGO = changeAllStringsInObjectRecursive(DB_MONGO, 'DB_PASSWORD', DB_PASSWORD);
        
DB_MONGO = changeAllStringsInObjectRecursive(DB_MONGO, 'MONGO_ID', MONGO_ID);



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