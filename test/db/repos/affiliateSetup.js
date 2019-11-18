import MongoComponent from './MongoComponent';
import { AffiliateSetupSchema } from '../schemas/affiliateSetup';

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

 const foreignKeys = ['affiliateStructures'];

class AffiliateSetupRepository extends MongoComponent{

    constructor(){
        super(AffiliateSetupSchema)
    }
    /**
     * @function setAffiliateSetupModel
     * @param AffiliateSetup Model
     * @return {Schema} AffiliateSetupModel
     */

    setModel = (AffiliateSetup) => {
        return AffiliateSetupRepository.prototype.schema.model(AffiliateSetup)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AffiliateSetupRepository.prototype.schema.model.findById(_id)
            .populate(foreignKeys)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    getAll = async() => {
        return new Promise( (resolve,reject) => {
            AffiliateSetupRepository.prototype.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

AffiliateSetupRepository.prototype.schema = new AffiliateSetupSchema();

export default AffiliateSetupRepository;