import MongoComponent from './MongoComponent';
import { DepositBonusSchema } from '../schemas';

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


class DepositBonusRepository extends MongoComponent{

    constructor(){
        super(DepositBonusSchema)
    }
    /**
     * @function setChatModel
     * @param DepositBonus Model
     * @return {Schema} PermissionModel
     */

    setModel = (DepositBonus) => {
        return DepositBonusRepository.prototype.schema.model(DepositBonus)
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            DepositBonusRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    isDepositBonus: {
                        currency             : currency,
                        value                : false,
                    },
                    min_deposit : {
                        currency             : currency,
                        amount               : 0,
                    },
                    percentage  : {
                        currency             : currency,
                        amount               : 0,
                    },
                    max_deposit : {
                        currency             : currency,
                        amount               : 0,
                    },
                    multiplier  : {
                        currency             : currency,
                        multiple             : 0,
                    }
                }} 
                )
            .exec( async (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            DepositBonusRepository.prototype.schema.model.findById(_id)
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, currency, newStructure){ 
        return new Promise( (resolve, reject) => {
            DepositBonusRepository.prototype.schema.model.updateOne(
                {_id, "isDepositBonus.currency": currency},
                { $set: {
                    "isDepositBonus.$.value"  : newStructure.isDepositBonus
                }}
                )
            .exec( async (err, item) => {
                await this.findByIdAndUpdateMaxDepositAmount(_id, currency, newStructure.max_deposit)
                await this.findByIdAndUpdateMinDepositAmount(_id, currency, newStructure.min_deposit)
                await this.findByIdAndUpdatePercentageAmount(_id, currency, newStructure.percentage)
                await this.findByIdAndUpdateMultiplierAmount(_id, currency, newStructure.multiplier)
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdateMaxDepositAmount(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            DepositBonusRepository.prototype.schema.model.updateOne(
                {_id, "max_deposit.currency": currency},
                {
                    $set: {
                        "max_deposit.$.amount" : parseFloat(amount)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    findByIdAndUpdateMinDepositAmount(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            DepositBonusRepository.prototype.schema.model.updateOne(
                {_id, "min_deposit.currency": currency},
                {
                    $set: {
                        "min_deposit.$.amount" : parseFloat(amount)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    findByIdAndUpdatePercentageAmount(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            DepositBonusRepository.prototype.schema.model.updateOne(
                {_id, "percentage.currency": currency},
                {
                    $set: {
                        "percentage.$.amount" : parseFloat(amount)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    findByIdAndUpdateMultiplierAmount(_id, currency, multiple){
        return new Promise( (resolve,reject) => {
            DepositBonusRepository.prototype.schema.model.updateOne(
                {_id, "multiplier.currency": currency},
                {
                    $set: {
                        "multiplier.$.multiple" : parseFloat(multiple)
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

DepositBonusRepository.prototype.schema = new DepositBonusSchema();

export default DepositBonusRepository;