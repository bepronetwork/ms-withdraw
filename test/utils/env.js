import { generateEthAccountWithTokensAndEthereum } from "./eth";
import { Admin, App, User } from "../models";
import { globals } from "../Globals";
import { WalletsRepository } from "../db/repos";

export async function createEthAccount({ethAmount, tokenAmount}){
    /* Create User Address and give it ETH */
    var eth_account = await generateEthAccountWithTokensAndEthereum({ETHAmount : ethAmount, tokenAmount : tokenAmount});
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

export async function registerAdmin(){
    let password = 'test123';
    let username = 'James' + Math.random(234234)*199999;
    /* Create Admin on Database */
    let admin = new Admin({
        username,
        name 			: 'Games',
        password,
        email			: `rui${Math.random(234234)*199999}@gmail.com`
    });
    let res = await admin.register();
    return {...res._doc, username, password};
}

export async function registerUser({address, app_id}){
    let password = 'test123';
    let username = 'Daf' + Math.random(234234)*199999;
    /* Create User on Database */
    let user = new User({
        username,
        name 			: 'Games',
        password,
        email			: `rui${Math.random(234234)*199999}@gmail.com`,
        full_name		: 'Ruie',
        address         : address,
        app			    : app_id
    });

    return { ...await user.register(), password, username };
}

export async function loginUser({username, password, app_id}){
    /* Create User on Database */
    let user = new User({
        username,
        password,
        app : app_id
    });

    let res_login = await user.login();
    user = new User(res_login);
    let bearerToken = await user.createAPIToken();
    return {...res_login, bearerToken}
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

export async function addBlockchainInformation({app_id, address,  platformAddress, platformBlockchain}){
    
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

    return await app.addBlockchainInformation();
    
}


export async function userConfirmDeposit({app_id, user_id, transactionHash, amount}){
    
    /* Create User on Database */
    let user = new User({
        app                 : app_id,
        user                : user_id,
        transactionHash     : transactionHash,
        amount              : amount,
    });

    return await user.updateWallet();
    
}



export async function appConfirmDeposit({app_id, transactionHash, amount}){
    /* Create User on Database */
    let app = new App({
        app                 : app_id,
        transactionHash     : transactionHash,
        amount              : amount
    });

    return await app.updateWallet();
    
}


export async function addWalletAffiliate({user, amount}){
    return await WalletsRepository.prototype.updatePlayBalance(user.affiliate.wallet, amount);
}
