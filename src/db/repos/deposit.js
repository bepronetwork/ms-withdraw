import MongoComponent from './MongoComponent';
import { DepositSchema } from '../schemas/deposit';
import { pipeline_transactions_app } from './pipelines/transactions';

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


const foreignKeys = ['user'];

class DepositRepository extends MongoComponent{

    constructor(){
        super(DepositSchema)
    }
    /**
     * @function setDepositModel
     * @param Deposit Model
     * @return {Schema} DepositModel
     */

    setModel = (Deposit) => {
        return DepositRepository.prototype.schema.model(Deposit)
    }
    
    findDepositById(_id){ 
        return new Promise( (resolve, reject) => {
            DepositRepository.prototype.schema.model.findById(_id)
            .populate(foreignKeys)
            .exec( (err, Deposit) => {
                if(err) { reject(err)}
                resolve(Deposit);
            });
        });
    }

    getTransactionsByApp(app, filters=[], size, offset){
        try{
            let pipeline =  pipeline_transactions_app(app, filters, size, offset);
            return new Promise( (resolve, reject) => {
                DepositRepository.prototype.schema.model
                .aggregate(pipeline)
                .exec( (err, deposits) => {
                    if(err) { 
                        deposits=[]
                        reject(err)}
                    resolve(deposits);
                });
            });
        }catch(err){
            throw err;
        }
    }

    getDepositByTransactionHash(transactionHash){
        return new Promise( (resolve, reject) => {
            DepositRepository.prototype.schema.model
            .findOne({ transactionHash })
            .lean()
            .exec( (err, Deposit) => {
                if(err) { reject(err)}
                resolve(Deposit)            
            });
        });
    }

    deleteDepositByTransactionHash(transactionHash){
        return new Promise( (resolve, reject) => {
            DepositRepository.prototype.schema.model
            .findOneAndDelete({ transactionHash })
            .lean()
            .exec( (err, Deposit) => {
                if(err) { reject(err)}
                resolve(Deposit)            
            });
        });
    }


    confirmDeposit(id, new_deposit_params){
        return new Promise( (resolve, reject) => {
            DepositRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $set: 
                    { 
                        amount                  : new_deposit_params.amount,
                        block                   : new_deposit_params.block,
                        usd_amount              : new_deposit_params.usd_amount,
                        confirmed               : new_deposit_params.confirmed,
                        confirmations           : new_deposit_params.confirmations,
                        maxConfirmations        : new_deposit_params.maxConfirmations,
                        last_update_timestamp   : new_deposit_params.last_update_timestamp
                }},{ new: true }
            )
            .lean()
            .exec( (err, Deposit) => {
                if(err) { reject(err)}
                resolve(Deposit);
            });
        });
    }

    async getAll({user, size, offset}) {
        try {
            return new Promise((resolve, reject) => {
                DepositRepository.prototype.schema.model.find({user: user})
                    .skip(offset == undefined ? 0 : offset)
                    .limit((size > 10 || !size || size <= 0) ? 10 : size)
                    .lean()
                    .exec((err, user) => {
                        if (err) { reject(err) }
                        resolve(user);
                    });
            });
        } catch (err) {
            throw (err)
        }
    }
}

DepositRepository.prototype.schema = new DepositSchema();

export default DepositRepository;