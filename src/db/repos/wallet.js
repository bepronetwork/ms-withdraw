import { Wallet } from "../models/wallet";
class WalletRepository {
    save(data){
        return new Promise((resolve, reject)=>{
            Wallet.create(data)
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }
}

WalletRepository = new WithdrawSchema();

export { WalletRepository };