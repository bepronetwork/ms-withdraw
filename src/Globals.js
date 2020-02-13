import { Mongoose } from "mongoose";
import Web3 from 'web3';
import CasinoContract from "./logic/eth/CasinoContract";
import account from "./logic/eth/models/account";
import interfaces from "./logic/eth/interfaces";
import ERC20TokenContract from "./logic/eth/ERC20Contract";
import { ETH_NETWORK, ETH_NET_NAME, DB_MONGO } from './config';
import { IPRunning } from "./helpers/network";
import { Logger } from "./helpers/logger";
import bluebird from 'bluebird';

class Globals{
    constructor(){
        this.web3 = new Web3(new Web3.providers.HttpProvider(ETH_NETWORK.url));
        this.account = new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(ETH_NETWORK.keys.home));
    }

    verify(){
        //Display All and Confirm Running
        globals.log();
    }

    getCasinoContract(address, tokenAddress){
        return new CasinoContract({
            web3 : this.web3,
            contractDeployed : interfaces.casino,
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(ETH_NETWORK.keys.home)), 
            erc20TokenContract : tokenAddress,
            contractAddress : address
        })
    }

    getERC20Contract(tokenAddress){
        let erc20Contract = new ERC20TokenContract({
            web3 : this.web3,
            contractAddress : tokenAddress,
            accountPrivateKey : ETH_NETWORK.keys.home,
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(ETH_NETWORK.keys.home))
        });

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
            account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(ETH_NETWORK.keys.home)), 
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

    log(){
        Logger.info("Running Address", this.account.getAddress());
        Logger.info(`ETH`, `${ETH_NET_NAME}`);
        Logger.info(`IP`, `${IPRunning()}`);
    }

    async connect(){      
        // Main DB
        this.main_db = new Mongoose();
        await this.main_db.connect(DB_MONGO.connection_string + DB_MONGO.dbs.main, {useMongoClient : true});
        this.main_db.Promise = bluebird;
        // Ecosystem DB
        this.ecosystem_db = new Mongoose();
        await this.ecosystem_db.connect(DB_MONGO.connection_string + DB_MONGO.dbs.ecosystem, {useMongoClient : true})
        this.ecosystem_db.Promise = bluebird;
        // Main DB
        this.default = new Mongoose();
        this.default.Promise = bluebird;
        return true;
        
    }
}

let globals = new Globals(); // Singleton

export {
    globals
}
