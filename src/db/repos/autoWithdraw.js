import MongoComponent from './MongoComponent';
import { AutoWithdrawSchema } from '../schemas';

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


class AutoWithdrawRepository extends MongoComponent{

    constructor(){
        super(AutoWithdrawSchema)
    }
    /**
     * @function setChatModel
     * @param AutoWithdraw Model
     * @return {Schema} PermissionModel
     */

    setModel = (AutoWithdraw) => {
        return AutoWithdrawRepository.prototype.schema.model(AutoWithdraw)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AutoWithdrawRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            AutoWithdrawRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    "maxWithdrawAmountCumulative"     : { currency, amount: 0 },
                    "maxWithdrawAmountPerTransaction" : { currency, amount: 0 }
                }} 
                )
            .exec( async (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, currency, newStructure){ 
        return new Promise( (resolve, reject) => {
            AutoWithdrawRepository.prototype.schema.model.findByIdAndUpdate(
                _id,
                { $set: {
                    "isAutoWithdraw"  : newStructure.isAutoWithdraw,
                    "verifiedKYC" : newStructure.verifiedKYC,
                }} 
                )
            .exec( async (err, item) => {
                await this.findByIdAndUpdateMaxWithdrawAmountCumulative(_id, currency, newStructure.maxWithdrawAmountCumulative)
                await this.findByIdAndUpdateMaxWithdrawAmountPerTransaction(_id, currency, newStructure.maxWithdrawAmountPerTransaction)
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdateMaxWithdrawAmountCumulative(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            AutoWithdrawRepository.prototype.schema.model.updateOne(
                {_id, "maxWithdrawAmountCumulative.currency": currency},
                {
                    $set: {
                        "maxWithdrawAmountCumulative.$.amount" : parseFloat(amount)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    findByIdAndUpdateMaxWithdrawAmountPerTransaction(_id, currency, amount){
        return new Promise( (resolve,reject) => {
            AutoWithdrawRepository.prototype.schema.model.updateOne(
                {_id, "maxWithdrawAmountPerTransaction.currency": currency},
                {
                    $set: {
                        "maxWithdrawAmountPerTransaction.$.amount" : parseFloat(amount)
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

AutoWithdrawRepository.prototype.schema = new AutoWithdrawSchema();

export default AutoWithdrawRepository;