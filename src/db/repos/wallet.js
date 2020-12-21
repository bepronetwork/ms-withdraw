import { Wallet as WalletModel } from "../models";
class Wallet {
    save(data){
        return new Promise((resolve, reject)=>{
            WalletModel.create(data)
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    findWalletBySubWalletId(subWalletId) {
        return new Promise((resolve, reject)=>{
            WalletModel.findOne({where: {subWalletId}})
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    findByUserAndTicker(user, ticker) {
        return new Promise((resolve, reject)=>{
            WalletModel.findOne({where: {user, ticker}})
            .then((res)=>{
                resolve(res);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }
}

const WalletRepository = new Wallet();

export { WalletRepository };