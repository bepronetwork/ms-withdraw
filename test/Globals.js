import config from './config/config';
import { Mongoose } from "mongoose";
import Web3 from 'web3';
import CasinoContract from "./logic/eth/CasinoContract";
import account from "./logic/eth/models/account";
import interfaces from "./logic/eth/interfaces";
import ERC20TokenContract from "./logic/eth/ERC20Contract";

const CONSTANTS = {
    net : config.eth.network,
    key : config.eth.keys.home,
    connection_string :config.mongo.connection_string,
    dbs : config.mongo.dbs,
    eth_url : config.eth.url,
    casino : interfaces.casino,
    currencyTicker : 'DAI',
    erc20TokenAddress : config.eth.erc20Address,
    tokenDecimals : 18,
    croupierAccountPK : config.eth.keys.mgmt,
    masterAccountPK : config.eth.keys.master,
    deploy : {
        tokenTransferAmount : 15,
        maxWithdrawal : 20,
        maxDeposit : 20
    }
}

Object.assign(global, CONSTANTS);

class Globals{
    constructor(){
        this.mongo = {
            dbs : CONSTANTS.dbs,
            connection_string  : CONSTANTS.connection_string
        }
        this.constants = CONSTANTS;
        this.web3 = new Web3(new Web3.providers.HttpProvider(CONSTANTS.eth_url));
        this.masterAccount = new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.masterAccountPK));
        this.croupierAccount = new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.croupierAccountPK))
        this.connect();
    }

    getCasinoContract(address, tokenAddress){
        return new CasinoContract({
            web3 : this.web3,
            contractDeployed : CONSTANTS.casino,
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key)), 
            erc20TokenContract : tokenAddress,
            contractAddress : address
        })
    }

    getERC20Contract(tokenAddress){
        let erc20Contract = new ERC20TokenContract({
            web3 : this.web3,
            contractAddress : tokenAddress,
            accountPrivateKey : CONSTANTS.key,
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key))
        })

        erc20Contract.__assert(
            {
                contractAddress : tokenAddress,
                contract_name : 'IERC20Token' 
            }
        );

        return erc20Contract;
    }

    newCasinoContract(params){
        return new CasinoContract({
            web3 : this.web3,
            contractDeployed : CONSTANTS.casino,
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key)), 
            erc20TokenContract : params.tokenAddress,
            tokenTransferAmount : params.tokenTransferAmount
        })
    }

    
    set(item, value){
        Object.defineProperty(this, item, value);
    }

    get(item){
        if( Object.getOwnPropertyDescriptor(this, item) ) {
            return this.mongo[item];
        }else{
            throw new Error("Key does not exist");
        }
    }

    getManagerAccount(){
        return this.account;
    }


    connect(){        
        // Main DB
        this.main_db = new Mongoose();
        this.main_db.connect(this.mongo.connection_string + this.mongo.dbs.main, {useMongoClient : true})
        this.main_db.Promise = global.Promise;

        // Ecosystem DB
        this.ecosystem_db = new Mongoose();
        this.ecosystem_db.connect(this.mongo.connection_string + this.mongo.dbs.ecosystem, {useMongoClient : true})
        this.ecosystem_db.Promise = global.Promise;

        // Main DB
        this.default = new Mongoose();
        this.default.Promise = global.Promise;
    }
    
}

let globals = new Globals(); // Singleton

export {
    globals
}
