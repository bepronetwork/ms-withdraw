import { Prototype } from "./prototype";
export class ETH extends Prototype{
    constructor(){
        super();
    }

    async sendETHtransaction(fromAddress, toAddress, amount, asset){
        return await this.getSettings().sendEthereum(fromAddress, toAddress, amount, asset, speed)
    }
}