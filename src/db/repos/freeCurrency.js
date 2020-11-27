import MongoComponent from './MongoComponent';
import { FreeCurrencySchema } from '../schemas';

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


class FreeCurrencyRepository extends MongoComponent{

    constructor(){
        super(FreeCurrencySchema)
    }
    /**
     * @function setFreeCurrencyModel
     * @param FreeCurrency Model
     * @return {Schema} FreeCurrencyModel
     */

    setModel = (FreeCurrency) => {
        return FreeCurrencyRepository.prototype.schema.model(FreeCurrency)
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            FreeCurrencyRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    "wallets" : { currency, activated: false, time: 3600000, value: 0 },
                }} 
                )
            .exec( async (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    updateFreeCurrency(_id, currency, params){
        return new Promise( (resolve,reject) => {
            FreeCurrencyRepository.prototype.schema.model.updateOne(
                {_id, "wallets.currency": currency},
                {
                    $set: {
                        "wallets.$.activated" : params.activated,
                        "wallets.$.time"      : params.time,
                        "wallets.$.value"     : params.value,
                        "wallets.$.multiplier": params.multiplier
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

}

FreeCurrencyRepository.prototype.schema = new FreeCurrencySchema();

export default FreeCurrencyRepository;