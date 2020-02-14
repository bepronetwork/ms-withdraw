import { generateEthAccountWithTokensAndEthereum } from "./eth";
import { Admin, App, User } from "../models";
import {
    registerUser as registerUserAPI,
    loginUser as loginUserAPI,
    updateUserWallet,
    updateAppWallet
} from '../methods';
import { globals } from "../Globals";
import { WalletsRepository } from "../db/repos";

export async function createEthAccount({ethAmount}){
    /* Create User Address and give it ETH */
    var eth_account = await generateEthAccountWithTokensAndEthereum({ETHAmount : ethAmount});
    return eth_account;
}

export async function loginAdmin({username, password}){
  /*  Get Admin Info */
    let admin = new Admin({
        username,
        password
    });
    let res_login = await admin.login();
    return res_login;
}


export async function appWalletInfo({app_id}){
    let app = new App({
        type : 'WALLET',
        periodicity : 'all',
        app : app_id
    });

    let res = await app.summary();
    return res;
}

export async function depositWallet({wallet_id, amount}){
    return await WalletsRepository.prototype.updatePlayBalance(wallet_id, amount);
}

export async function registerAdmin(){
    let password = 'test123';
    let username = 'James' + Math.random(234234)*199999;
    /* Create Admin on Database */
    let admin = new Admin();
    
    let res = await admin.register();
    return {...res.data.message, username, password};
}

export async function registerUser({address, app_id}){
    let password = 'test123';
    let username = 'Daf' + Math.random(234234)*199999;
    /* Create User on Database */
    let postData = {
        username,
        name 			: 'Games',
        password,
        email			: `rui${Math.random(234234)*199999}@gmail.com`,
        full_name		: 'Ruie',
        address         : address,
        app			    : app_id
    };

    let user = await registerUserAPI(postData);
    user = (await loginUser({
        ...postData,
        app_id : app_id
    }));
    return { ...user, password, username };
}

export async function loginUser({username, password, app_id}){
    return (await loginUserAPI({
        username,
        password,
        app : app_id
    })).data.message;
}

export async function registerApp({admin_id}){
    /* Create User on Database */
    let app = new App({
        services            : [101, 201], // Array
        admin_id		    : admin_id,
        name    			: 'App Test' + Math.random(234234)*199999,
        metadataJSON        : "{}",
        description         : 'App test',
        marketType          : 0
    });
    let res = await app.register();

    app =  new App({
        app : res.id
    });
    let res_api_token = await app.createAPIToken();
    return {...res, bearerToken : res_api_token.bearerToken};
}

export async function addCurrencyWallet({app_id, address,  platformAddress, platformBlockchain}){
    
    /* Create User on Database */
    let app = new App({
        app : app_id,
        address : address,
        decimals : globals.constants.tokenDecimals,
        authorizedAddress : globals.croupierAccount.getAddress(),
        currencyTicker : globals.constants.currencyTicker,
        platformAddress : platformAddress, 
        platformBlockchain : platformBlockchain, 
        platformTokenAddress : globals.constants.erc20TokenAddress, 
    });

    return await app.addCurrencyWallet();
    
}

export async function addWalletAffiliate({user, amount, currency}){
    const wallet_id = user.affiliateInfo.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(currency.ticker).toLowerCase());
    return await WalletsRepository.prototype.updatePlayBalance(wallet_id, amount);
}
