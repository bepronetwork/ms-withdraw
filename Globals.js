import {DB_STRING} from "./src/config";

const { Sequelize } = require('sequelize');
class Globals{
    constructor(){
        this.connect();
    }

    // getCasinoContract(address, tokenAddress){
    //     return new CasinoContract({
    //         web3 : this.web3,
    //         contractDeployed : CONSTANTS.casino,
    //         account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key)), 
    //         erc20TokenContract : tokenAddress,
    //         contractAddress : address
    //     })
    // }

    // getERC20Contract(tokenAddress){
    //     let erc20Contract = new ERC20TokenContract({
    //         web3 : this.web3,
    //         contractAddress : tokenAddress,
    //         accountPrivateKey : CONSTANTS.key,
    //         account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key))
    //     })

    //     erc20Contract.__assert(
    //         {
    //             contractAddress : tokenAddress,
    //             contract_name : 'IERC20Token' 
    //         }
    //     );

    //     return erc20Contract;
    // }

    // newCasinoContract(params){
    //     return new CasinoContract({
    //         web3 : this.web3,
    //         contractDeployed : CONSTANTS.casino,
    //         account : new account(this.web3, this.web3.eth.accounts.privateKeyToAccount(CONSTANTS.key)), 
    //         erc20TokenContract : params.tokenAddress,
    //         tokenTransferAmount : params.tokenTransferAmount
    //     })
    // }

    
    set(item, value){
        Object.defineProperty(this, item, value);
    }

    // get(item){
    //     if( Object.getOwnPropertyDescriptor(this, item) ) {
    //         return this.mongo[item];
    //     }else{
    //         throw new Error("Key does not exist");
    //     }
    // }

    // getManagerAccount(){
    //     return this.account;
    // }


    connect(){
        this.DB = new Sequelize(DB_STRING);
    }
}

let globals = new Globals(); // Singleton

export {
    globals
}