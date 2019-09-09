const WEI = 1000000000;
const GAS_PRICE = 10000*WEI;

class account{
    constructor(web3, account){
        this.web3 = web3;
        this.account = account;
    }


    async getBalance(){
        let wei = await this.web3.eth.getBalance(this.getAddress());
        return this.web3.utils.fromWei(wei, 'ether')
    }

    getAddress(){
        return this.account.address;
    }

    getPrivateKey(){
        return this.account.privateKey;
    }

    getAccount(){
        return this.account
    }

    async sendEther(amount, address, data=null){
        return new Promise( async (resolve, reject) => {
            try{
                let tx = {
                    data : data,
                    from  : this.getAddress(),
                    to : address,
                    gasPrice : 20000000000,
                    gas : 4000000,
                    value: this.web3.utils.toWei(amount.toString(), 'ether')
                }
                let result = await this.account.signTransaction(tx);
                this.web3.eth.sendSignedTransaction(result.rawTransaction)
                .on('confirmation', (confirmations, receipt) => {
                    resolve(receipt)
                })
                .on('error', (err) => {reject(err)})
                .on('receipt', (e) => {resolve(true)});
            }catch(err){
                reject(err);
            }
        })
       
        return transaction;
    }

}


export default account;