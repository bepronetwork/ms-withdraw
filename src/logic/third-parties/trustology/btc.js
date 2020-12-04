import { Prototype } from "./prototype";
export class BTC extends Prototype{
    constructor(){
        super();
    }

    async sendTransaction(fromSubWalletId, toAddress, amount, speed, signCallback){
        return await this.getSettings().sendBitcoin(fromSubWalletId, toAddress, amount, speed, signCallback);
    }

    generateAddress(walletId, userId) {
        return new Promise((resolve, reject)=>{
            const data = JSON.stringify({
                query: 'mutation($type: SubWalletType!, $name: String!, $walletId: String!, ) {\n    createSubWallet(\n        createSubWalletInput: {\n            type: $type,\n            name: $name,\n            walletId: $walletId,\n        }\n    ) {\n        subWalletId\n    }\n}',
                variables: {"type":"BTC","name":userId,"walletId":walletId}
            });

            axios(this.axiosConfig(data))
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                resolve(response.data);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

}