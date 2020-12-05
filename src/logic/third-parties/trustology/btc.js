import { Prototype } from "./prototype";
export class BTC extends Prototype{
    constructor(){
        super();
    }

    async sendTransaction(fromSubWalletId, toAddress, amount){
        return await this.getSettings().sendBitcoin(fromSubWalletId, toAddress, amount, speed);
    }

}