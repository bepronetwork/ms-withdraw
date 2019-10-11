import MongoComponent from './MongoComponent';
import { AffiliateSchema } from '../schemas/affiliate';

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


class AffiliateRepository extends MongoComponent{

    constructor(){
        super(AffiliateSchema)
    }
    /**
     * @function setAffiliateModel
     * @param Affiliate Model
     * @return {Schema} AffiliateModel
     */

    setModel = (Affiliate) => {
        return AffiliateRepository.prototype.schema.model(Affiliate)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AffiliateRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    async addAffiliateLinkChild(_id, affiliate_link){
        return new Promise( (resolve,reject) => {
            AffiliateRepository.prototype.schema.model.findOneAndUpdate(
                { _id: _id, bets : {$nin : [affiliate_link] } }, 
                { $push: { "affiliatedLinks" : affiliate_link } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        })
    }

    getAll = async() => {
        return new Promise( (resolve,reject) => {
            AffiliateRepository.prototype.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

AffiliateRepository.prototype.schema = new AffiliateSchema();

export default AffiliateRepository;