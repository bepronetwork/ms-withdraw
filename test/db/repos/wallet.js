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
                { $inc : { [currency] : parseFloat(amount).toFixed(6) } } ,{ new: true }
            )
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    updatePlayBalance(id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $inc : { playBalance : parseFloat(amount).toFixed(6) } } ,{ new: true }
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
}

WalletsRepository.prototype.schema = new WalletSchema();

export default WalletsRepository;