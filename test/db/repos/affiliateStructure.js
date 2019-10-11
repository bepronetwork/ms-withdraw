import MongoComponent from './MongoComponent';
import { AffiliateStructureSchema } from '../schemas/affiliateStructure';

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


class AffiliateStructureRepository extends MongoComponent{

    constructor(){
        super(AffiliateStructureSchema)
    }
    /**
     * @function setAffiliateStructureModel
     * @param AffiliateStructure Model
     * @return {Schema} AffiliateStructureModel
     */

    setModel = (AffiliateStructure) => {
        return AffiliateStructureRepository.prototype.schema.model(AffiliateStructure)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AffiliateStructureRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, newStructure){
        return new Promise( (resolve,reject) => {
            AffiliateStructureRepository.prototype.schema.model.findByIdAndUpdate(
                _id, 
                { $set: { 
                    "level" : newStructure.level,
                    "percentageOnLoss" : newStructure.percentageOnLoss,
                    "isActive"   : newStructure.isActive,
                } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    getAll = async() => {
        return new Promise( (resolve,reject) => {
            AffiliateStructureRepository.prototype.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

AffiliateStructureRepository.prototype.schema = new AffiliateStructureSchema();

export default AffiliateStructureRepository;