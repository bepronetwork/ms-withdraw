const __config = require('./config/config');
import { Mongoose } from "mongoose";
import Web3 from 'web3';
import CasinoContract from "./logic/eth/CasinoContract";
import account from "./logic/eth/models/account";
import interfaces from "./logic/eth/interfaces";
import ERC20TokenContract from "./logic/eth/ERC20Contract";
import { Logger } from "./src/helpers/logger";

let ETH_NETWORK = process.env.ETH_NETWORK || 'rinkeby';

const CONSTANTS = {
    net : ETH_NETWORK,
    key : __config.default.eth[ETH_NETWORK].keys.home,
    erc20Address : __config.default.eth[ETH_NETWORK].addresses.erc20,
    connection_string : __config.default.mongo.connection_string,
    dbs : __config.default.mongo.dbs,
    eth_url : __config.default.eth[ETH_NETWORK].url,
    casinoAddress : __config.default.eth[ETH_NETWORK].casino,
    casino        : interfaces.casino
}

Object.assign(global, CONSTANTS);

class Globals{
    constructor(){
        
        this.mongo = {
            dbs : CONSTANTS.dbs,
            connection_string  : CONSTANTS.connection_string
        }

        this.web3 = new Web3(new Web3.providers.HttpProvider(CONSTANTS.eth_url));
        this.account = new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key));
        this.casinoContract = new CasinoContract({
            web3 : this.web3,
            contractDeployed : CONSTANTS.casino,
            account : this.account,
            erc20TokenContract : this.getERC20Contract(CONSTANTS.erc20Address),
            contractAddress : CONSTANTS.casinoAddress
        })

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
