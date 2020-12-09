import MongoComponent from './MongoComponent';
import { PointSystemSchema } from '../schemas';

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


class PointSystemRepository extends MongoComponent{

    constructor(){
        super(PointSystemSchema)
    }
    /**
     * @function setChatModel
     * @param PointSystem Model
     * @return {Schema} PermissionModel
     */

    setModel = (PointSystem) => {
        return PointSystemRepository.prototype.schema.model(PointSystem)
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            PointSystemRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    ratio : {
                        currency,
                        value : 0
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
            PointSystemRepository.prototype.schema.model.findById(_id)
            .lean()
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, currency, newStructure){ 
        return new Promise( (resolve, reject) => {
            PointSystemRepository.prototype.schema.model.findByIdAndUpdate(
                _id,
                { $set: {
                    "isValid" : newStructure.isValid,
                    "logo"    : newStructure.logo,
                    "name"    : newStructure.name
                }}
                )
                .lean()
            .exec( async (err, item) => {
                await this.findByIdAndUpdateRatio(_id, currency, newStructure.ratio)
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdateRatio(_id, currency, value){
        return new Promise( (resolve,reject) => {
            PointSystemRepository.prototype.schema.model.updateOne(
                {_id, "ratio.currency": currency},
                {
                    $set: {
                        "ratio.$.value" : parseFloat(value)
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

PointSystemRepository.prototype.schema = new PointSystemSchema();

export default PointSystemRepository;