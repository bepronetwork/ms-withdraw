import MongoComponent from './MongoComponent';
import { WalletSchema } from '../schemas/wallet';

/**
 * Accounts database interaction class.
 *
 * @class
 * @memberof db.repos.accounts
 * @requires bluebird
 * @requires lodash
 * @requires db/sql.accounts
 * @see Parent: {@link db.repos.accounts}
 */


class WalletsRepository extends MongoComponent{

    constructor(){
        super(WalletSchema)
    }
    /**
     * @function setWalletModel
     * @param Wallet Model
     * @return {Schema} WalletModel
     */

    setModel = (Wallet) => {
        return WalletsRepository.prototype.schema.model(Wallet)
    }

    updateCurrencyAmount(id, currency, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $inc : { [currency] : amount } } ,{ new: true }
            )
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updateMaxWithdraw(wallet_id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(wallet_id, {
                max_withdraw: amount
            })
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    addCurrencyDepositToVirtualCurrency(virtual_wallet_id, currency_id){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findOneAndUpdate( 
                { _id: virtual_wallet_id }, 
                { $push: { "price" : {
                    currency        : currency_id,
                    amount          : PRICE_VIRTUAL_CURRENCY_GLOBAL
                } } },
                { 'new': true }
            )
            .lean()
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updateBitgoIdNotWebhook(_id, bitgoIdNotWebhook) {
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(_id,
                { $set: {
                    "bitgo_id_not_webhook" : bitgoIdNotWebhook
                } },
                { new: true }
            )
            .lean()
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updateAddress2(id, address) {
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $set: {
                    "bank_address_not_webhook" : address
                } },
                { new: true }
            )
            .lean()
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    addDepositAddress(wallet_id, address){        
        return new Promise( (resolve,reject) => {
            WalletsRepository.prototype.schema.model.findOneAndUpdate(
                { _id: wallet_id, "depositAddresses" : {$nin : [address] } }, 
                { $push: { "depositAddresses" : address } },
                { 'new': true })
                .lean()
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }

    addSubWalletId(wallet_id, subWalletId){        
        return new Promise( (resolve,reject) => {
            WalletsRepository.prototype.schema.model.findOneAndUpdate(
                { _id: wallet_id }, 
                { $set: { subWalletId } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }
    updateMinWithdraw(wallet_id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(wallet_id, {
                min_withdraw: amount
            })
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updateAffliateMinWithdraw(wallet_id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(wallet_id, {
                affiliate_min_withdraw: amount
            })
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updatePlayBalance(id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $inc : { playBalance : amount } } ,{ new: true }
            )
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }
  
    getAll = async() => {
        return new Promise( (resolve,reject) => {
            WalletsRepository.prototype.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }

    updateBonusAndAmount({wallet_id, playBalance, bonusAmount}){        
        return new Promise( (resolve,reject) => {
            WalletsRepository.prototype.schema.model.findOneAndUpdate(
                { _id: wallet_id}, 
                { $set: { 
                    "playBalance" : playBalance,
                    "bonusAmount" : bonusAmount
                } })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }
}

WalletsRepository.prototype.schema = new WalletSchema();

export default WalletsRepository;