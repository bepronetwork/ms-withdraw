import MongoComponent from './MongoComponent';
import { TxFeeSchema } from '../schemas';

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


class TxFeeRepository extends MongoComponent{

    constructor(){
        super(TxFeeSchema)
    }
    /**
     * @function setChatModel
     * @param TxFee Model
     * @return {Schema} PermissionModel
     */

    setModel = (TxFee) => {
        return TxFeeRepository.prototype.schema.model(TxFee)
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            TxFeeRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    deposit_fee: {
                        currency,
                        amount: 0,
                    },
                    withdraw_fee: {
                        currency,
                        amount: 0,
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
            TxFeeRepository.prototype.schema.model.findById(_id)
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, currency, newStructure){ 
        return new Promise( (resolve, reject) => {
            TxFeeRepository.prototype.schema.model.findByIdAndUpdate(
                _id,
                { $set: {
                    "isTxFee"  : newStructure.isTxFee,
                }} 
                )
            .exec( async (err, item) => {
                await this.findByIdAndUpdateDepositFee(_id, currency, newStructure.deposit_fee)
                await this.findByIdAndUpdateWithdrawFee(_id, currency, newStructure.withdraw_fee)
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdateDepositFee(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            TxFeeRepository.prototype.schema.model.updateOne(
                {_id, "deposit_fee.currency": currency},
                {
                    $set: {
                        "deposit_fee.$.amount" : parseFloat(amount)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    findByIdAndUpdateWithdrawFee(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            TxFeeRepository.prototype.schema.model.updateOne(
                {_id, "withdraw_fee.currency": currency},
                {
                    $set: {
                        "withdraw_fee.$.amount" : parseFloat(amount)
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

TxFeeRepository.prototype.schema = new TxFeeSchema();

export default TxFeeRepository;