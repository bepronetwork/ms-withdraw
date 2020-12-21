require('dotenv').config();
const config = require('./config.json');
import { changeAllStringsInObjectRecursive } from '../helpers/object.js';
export const PORT = process.env.PORT;

/* ENV */


export const LIMIT =  process.env.LIMIT || 1;

export const RATE =  process.env.RATE || 100;

export const APP_MGMT_PRIVATE_KEY =  process.env.APP_MGMT_PRIVATE_KEY;

export const ETH_TEST_NET = process.env.ETH_NET; 

export const INFURA_KEY = process.env.INFURA_KEY; 

export const ETH_NET_NAME = process.env.ETH_NET_NAME;

export const DB_STRING = process.env.DB_STRING;

export const ETH_RPC_URL = process.env.ETH_RPC_URL;

export const TRUSTOLOGY_MANUAL_WALLETID_BTC = process.env.TRUSTOLOGY_MANUAL_WALLETID_BTC;

export const TRUSTOLOGY_MANUAL_WALLETID_ETH = process.env.TRUSTOLOGY_MANUAL_WALLETID_ETH;

export const PUBLIC_KEY = process.env.PUBLIC_KEY;

export const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const MIN_WITHDRAW = parseFloat(process.env.MIN_WITHDRAW);

export const MS_MASTER_URL = process.env.MS_MASTER_URL;

export const QUOTA_GUARD_URL = process.env.QUOTA_GUARD_URL;

export const IS_DEVELOPMENT = process.env.ENV == 'development';

export const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;

export const SENDINBLUE_EMAIL_TO = process.env.SENDINBLUE_EMAIL_TO;

export const TRUSTOLOGY_PRIVATE_KEY_BTC = process.env.TRUSTOLOGY_PRIVATE_KEY_BTC;

export const TRUSTOLOGY_PRIVATE_KEY_ETH = process.env.TRUSTOLOGY_PRIVATE_KEY_ETH;

export const TRUSTOLOGY_API_KEY = process.env.TRUSTOLOGY_API_KEY;

export const TRUSTOLOGY_URL = process.env.TRUSTOLOGY_URL;

export const TRUSTOLOGY_AUTO_WALLETID_BTC = process.env.TRUSTOLOGY_AUTO_WALLETID_BTC;

export const TRUSTOLOGY_WALLETID_ETH = process.env.TRUSTOLOGY_WALLETID_ETH;

export const TRUSTOLOGY_WEBHOOK_KEY_ETH = process.env.TRUSTOLOGY_WEBHOOK_KEY_ETH;

export const TRUSTOLOGY_WEBHOOK_KEY_BTC = process.env.TRUSTOLOGY_WEBHOOK_KEY_BTC;

export const PUSHER_APP_ID = process.env.PUSHER_APP_ID;

export const PUSHER_APP_KEY = process.env.PUSHER_APP_KEY;

export const PUSHER_APP_SECRET = process.env.PUSHER_APP_SECRET;

export const ETHEREUM_AUTO_ADDRESS = process.env.ETHEREUM_AUTO_ADDRESS;

export const TRUSTOLOGY_MANUAL_WALLETID_BTC = process.env.TRUSTOLOGY_MANUAL_WALLETID_BTC;

export const TRUSTOLOGY_MANUAL_ADDRESS_ETH = process.env.TRUSTOLOGY_MANUAL_ADDRESS_ETH;

export const ENV = process.env.ENV;

/* Variables */

var ETH_NETWORK = config.eth;

if(ETH_RPC_URL){
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'APP_MGMT_PRIVATE_KEY', APP_MGMT_PRIVATE_KEY);
    ETH_NETWORK.url = ETH_RPC_URL;
}else{
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'APP_MGMT_PRIVATE_KEY', APP_MGMT_PRIVATE_KEY);
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'ETH_NET_NAME', ETH_NET_NAME);
    ETH_NETWORK = changeAllStringsInObjectRecursive(ETH_NETWORK, 'INFURA_KEY', INFURA_KEY);
}

export {
    ETH_NETWORK
}
