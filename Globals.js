const __config = require('./config/config');
import {DB_STRING} from "./src/config";
import Web3 from 'web3';
import CasinoContract from "./logic/eth/CasinoContract";
import account from "./logic/eth/models/account";
import interfaces from "./logic/eth/interfaces";
import ERC20TokenContract from "./logic/eth/ERC20Contract";
import { Logger } from "./src/helpers/logger";

const { Sequelize } = require('sequelize');

let ETH_NETWORK = process.env.ETH_NETWORK || 'kovan';

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
        this.DB = new Sequelize(DB_STRING);
    }
}

let globals = new Globals(); // Singleton

export {
    globals
}
