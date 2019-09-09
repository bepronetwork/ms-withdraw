import contract from "./models/contract";
import {
    ierc20
} from './interfaces';
import Numbers from "../services/numbers";

const options = {
    token_amount : 1000000000 ,
    decimals : 18
}

let self;


class ERC20TokenContract{

    constructor(params){
        self = {
            contract : 
                new contract({
                    web3 : params.web3,
                    contract : ierc20, 
                    address : params.contractAddress
            }),
            ...params
        }

     
    }

    __assert(){
        self.contract.use(
            ierc20,
            self.contractAddress);
    }

    async __init__(){
        let contractDepolyed = await this.deploy();
          // Start Contract use
        this.__assert(contractDepolyed);
    }

    async deploy(){
        console.log("Deploying...");
        let params = [
            options.token_amount,
            options.decimals
        ];//[params]

        let res = await self.contract.deploy(
            self.account.getAccount(), 
            self.contract.getABI(), 
            self.contract.getJSON().bytecode, 
            params);
        return res;
    }   

    getContract(){
        return self.contract.getContract();
    }

    getAddress(){
        return self.contract.getAddress();
    }

    getTotalTokenAmount(){
        return options.token_amount;
    }

    async transferTokenAmount({fromAccount, toAddress, tokenAmount, decimals}){
        let amountWithDecimals = Numbers.toSmartContractDecimals(tokenAmount, decimals);
        let data = self.contract.getContract().methods.transfer(
            toAddress,
            amountWithDecimals
        ).encodeABI(); 
        let res =  await self.contract.send(fromAccount.getAccount(), data);  
        return res;
    }

    async getTokenAmount(address){
        return await self.contract.getContract().methods.balanceOf(address).call();
    }

    getABI(){
        return self.contract;
    }
    
    async allowWithdrawalFromContract({account, platformAddress, amount, decimals}){
        try{
            let amountWithDecimals = Numbers.toSmartContractDecimals(amount, decimals);

            let data = self.contract.getContract().methods.approve(
                platformAddress,
                amountWithDecimals
            ).encodeABI(); 
            return await self.contract.send(account.getAccount(), data);  
        }catch(err){
            throw err
        }
    }
}



export default ERC20TokenContract;