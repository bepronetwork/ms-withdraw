import {
    casino
} from "./interfaces";
import contract from "./models/contract";
import { fromBigNumberToInteger, fromDecimals, fromExponential } from "../services/services";
import ERC20TokenContract from "./ERC20Contract";

import Numbers from "../services/numbers";

class CasinoContract{
    constructor(params){
        try{
            this.params = {
                contract : 
                new contract({
                    web3 : params.web3,
                    contract : casino, 
                    address : params.contractAddress,
                    tokenTransferAmount : params.tokenTransferAmount
                }),
                erc20TokenContract :  params.erc20TokenContract ? params.erc20TokenContract : 
                new ERC20TokenContract({
                    web3 : params.web3,
                    contractAddress : params.tokenAddress
                }),
                ...params
            }
            this.decimals = params.decimals;
        }catch(err){console.log(err)}
      
    }

      /**
     * @constructor Starting Function
     */

    async __init__(){
        try{
            let contractDepolyed = await this.deploy();
            let response = await this.sendTokensToCasinoContract(this.params.tokenTransferAmount);
            this.__assert(contractDepolyed);
            return {
                amount : this.params.tokenAddress,
                transactionHash : response.transactionHash
            };
        }catch(err){
            console.log(err)
        }
    }

    async authorize(addr){
        try{
            let data = await this.params.contract.getContract().methods.authorize(
                addr
            ).encodeABI();
            let res =  await this.params.contract.send(this.params.account.getAccount(), data);
            return res;
        }catch(err){
            console.log(err);
        }   
    }
    
    isAuthorized = async (address) => {
        try{
            return await this.params.contract.getContract().methods.authorized(address).call();
        }catch(err){
            console.log(err);
        }   
    }



    __assert(){
        this.params.contract.use(
            casino,
            this.params.contractAddress
        );
    }

    /**
     * @constructor Starting Function
     */

    getDecimals = () => this.decimals;
  
    sendTokensToCasinoContract = async (tokenAmount) => {
        try{
            let tokenAmountWithDecimals = Numbers.toSmartContractDecimals(tokenAmount, this.getDecimals());
            let data = await this.params.erc20TokenContract.getContract().methods.transfer(
                this.params.contractAddress,
                tokenAmountWithDecimals
            ).encodeABI();
            let res = await this.params.erc20TokenContract.getABI().send(this.params.account.getAccount(), data);
            return res;
        }catch(err){
            throw new Error(`Possibly the Owner Account Address : ${this.params.account.getAddress()} does not have ${tokenAmount} Tokens to send to the Contract (Providing Liquidity)`)
        }   
    }
    
    async start(){
        try{
            let balance = await this.params.account.getBalance();
            if(balance < 0.1){throw new Error(`Lack of Funds - Add more Funds to Address : ${this.params.account.getAddress()} to complete Testing`)}
        }catch(err){
            console.log(err);
        }
    }

    setAccount = (acc) => this.params.account = acc;

    async changeWithdrawalTimeLimit({time}){
        try{
            let SCTime = Numbers.fromMinutesToSmartContracTime(time);
            let data = await this.params.contract.getContract().methods.changeReleaseTime(
                SCTime
            ).encodeABI();
            let response = await this.params.contract.send(this.params.account.getAccount(), data);  
            return response;   
        }catch(err){
            throw err;
        }
    }


    async getWithdrawalTimeLimit(){
        try{
            return Numbers.fromSmartContractTimeToMinutes(await this.params.contract.getContract().methods.releaseTime().call());
        }catch(err){
            console.log(err)
            return 'N/A';
        }
    }

    async approveOwnerWithdrawal({newPlayersBalance, decimals, address, amount}){
        try{
            let data = await this.params.contract.getContract().methods.setOwnerWithdrawal(
                address, 
                Numbers.toSmartContractDecimals(newPlayersBalance, decimals),
                Numbers.toSmartContractDecimals(amount, decimals)
                ).encodeABI();
            let response = await this.params.contract.send(this.params.account.getAccount(), data);
            return response;  
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async getApprovedWithdrawAmount({address, decimals=this.decimals}){
        try{
            let res = await this.params.contract.getContract().methods.withdrawals(address).call();
            if(!res || (parseFloat(res) == 0)){
                return 0;
            }else{
                return Numbers.toFloat(Numbers.fromDecimals(parseInt(res.amount), decimals))
            }
        }catch(err){
            throw err;
        }
    }

    async getHouseBalance(){
        try{
            let playersTokenAmount = await this.getPlayersBalance();
            let houseAmount = await this.getTotalLiquidity();
            return houseAmount - playersTokenAmount;
        }catch(err){
            return 'N/A';
        }
    }

    async getUserBalance(address){
        try{
            return fromBigNumberToInteger(await this.params.contract.getContract().methods.balances(address).call());
        }catch(err){
            console.log(err);
            return 'N/A';
        }
    }

    async getPlayersBalance(){
        try{
            return fromBigNumberToInteger(await this.params.contract.getContract().methods.totalPlayerBalance().call());
        }catch(err){
            console.log(err);
            return 'N/A';
        }
    }


    async getMaxDeposit(){
        try{
            return fromBigNumberToInteger(await this.params.contract.getContract().methods.maxDeposit().call());
        }catch(err){
            console.log(err);
            return 'N/A';
        }
    }

    async setMaxWithdrawal(maxWithdrawal){
        try{
            let amountWithDecimals = Numbers.toSmartContractDecimals(maxWithdrawal, this.getDecimals());
            let data = this.params.contract.getContract().methods.changeMaxWithdrawal(amountWithDecimals).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    async setMaxDeposit(maxDeposit){
        try{
            let amountWithDecimals = Numbers.toSmartContractDecimals(maxDeposit, this.getDecimals());
            let data = this.params.contract.getContract().methods.changeMaxDeposit(amountWithDecimals).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    async authorizeCroupier(address){
        try{
            let data = this.params.contract.getContract().methods.authorizeCroupier(address).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    async authorizeAddress(address){
        try{
            let data = this.params.contract.getContract().methods.authorizeAccount(address).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    async getTotalLiquidity(){
        try{
            return fromBigNumberToInteger(await this.params.erc20TokenContract.getTokenAmount(this.getAddress()));
        }catch(err){
            console.log(err);
            return 'N/A';
        }
    }

    async withdrawApp({receiverAddress, account=this.params.account,  amount}){
        try{
            let amountWithDecimals = Numbers.toSmartContractDecimals(amount, this.decimals);
            let data = this.params.contract.getContract().methods.ownerWithdrawalTokens(
                receiverAddress,
                amountWithDecimals
            ).encodeABI(); 
            return await this.params.contract.send(account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    fromIntToFloatEthereum(int){
        return Math.round(int*100);
    }


    /**
     * @Functions
     */

    async deploy(){
            try{            
            
            let params = [
                this.params.erc20TokenContract.getAddress(),  // ERC-20 Token Contract
                this.params.authorizedAddress,                     // Authorized Address
                this.params.account.getAddress()              // Owner Address
            ];

            let res = await this.params.contract.deploy(
                this.params.account.getAccount(), 
                this.params.contract.getABI(), 
                this.params.contract.getJSON().bytecode, 
                params);
            this.params.contractAddress = res.contractAddress;
            return res;
        }catch(err){
            console.log(err)
            throw err;
        }
    }

    getAddress(){
        return this.params.contractAddress;
    }

    async isPaused(){
        try{
            return await this.params.contract.getContract().methods.paused().call();
        }catch(err){
            return 'N/A';
        }
    }

    async pauseContract(){
        try{
            let data = this.params.contract.getContract().methods.pause().encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            throw err;
        }
    }

    async unpauseContract(){
        try{
            let data = this.params.contract.getContract().methods.unpause().encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            throw err;
        }
    }


    async depositFunds({amount}){
        try{
            await this.allowWithdrawalFromContract({amount});
            let amountWithDecimals = Numbers.toSmartContractDecimals(amount, this.getDecimals());
            let data = this.params.contract.getContract().methods.deposit(
                amountWithDecimals
            ).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            console.log(err)
        }
    }

    async withdrawUserFundsAsOwner({userAddress, amount}){
        try{
            let amountWithDecimals = Numbers.toSmartContractDecimals(amount, this.getDecimals());
            let data = this.params.contract.getContract().methods.setUserWithdrawal(
                userAddress , amountWithDecimals
            ).encodeABI(); 
            return await this.params.contract.send(this.params.account.getAccount(), data);  
        }catch(err){
            throw err;
        }
    }

    async allowWithdrawalFromContract({amount}){
        try{
            await this.params.erc20TokenContract.allowWithdrawalFromContract({
                account : this.params.account,
                amount,
                decimals : this.getDecimals(),
                platformAddress  : this.params.contract.getAddress()
            })
            return true;
        }catch(err){
            console.log(err)
        }
    }
}



export default CasinoContract;