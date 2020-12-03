class BTC extends Prototype{
    constructor(){
        super();
    }

    async sendTransaction(fromSubWalletId, toAddress, amount, speed, signCallback){
        return await this.trustVault.sendBitcoin(fromSubWalletId, toAddress, amount, speed, signCallback);
    }

}