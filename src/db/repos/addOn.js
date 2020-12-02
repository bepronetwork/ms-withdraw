import MongoComponent from './MongoComponent';
import { AddOnSchema } from '../schemas';

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


class AddOnRepository extends MongoComponent{

    constructor(){
        super(AddOnSchema)
    }
    /**
     * @function setAddOnModel
     * @param AddOn Model
     * @return {Schema} AddOnModel
     */

    setModel = (AddOn) => {
        return AddOnRepository.prototype.schema.model(AddOn)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findById(_id)
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    addAddonJackpot(addOn_id, jackpot){ 
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {jackpot}
                }
            )
            .lean()
            .exec((err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonBalance(addOn_id, balance){ 
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {balance}
                }
            )
            .lean()
            .exec((err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonFreeCurrency(addOn_id, freeCurrency){ 
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {freeCurrency}
                }
            )
            .lean()
            .exec((err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonAutoWithdraw(addOn_id, autoWithdraw){
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {autoWithdraw}
                },
                {'new': true}
            )
            .lean()
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonTxFee(addOn_id, txFee){
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {txFee}
                },
                {'new': true}
            )
            .lean()
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonDepositBonus(addOn_id, depositBonus){
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {depositBonus}
                },
                {'new': true}
            )
            .lean()
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    addAddonPointSystem(addOn_id, pointSystem){
        return new Promise( (resolve, reject) => {
            AddOnRepository.prototype.schema.model.findByIdAndUpdate(
                addOn_id,
                {
                    $set: {pointSystem}
                },
                {'new': true}
            )
            .lean()
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

}

AddOnRepository.prototype.schema = new AddOnSchema();

export default AddOnRepository;