import MongoComponent from './MongoComponent';
import { AffiliateLinkSchema } from '../schemas/affiliateLink';
import { populate_affiliateLink } from './populates';

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


class AffiliateLinkRepository extends MongoComponent{

    constructor(){
        super(AffiliateLinkSchema)
    }
    /**
     * @function setAffiliateLinkModel
     * @param AffiliateLink Model
     * @return {Schema} AffiliateLinkModel
     */

    setModel = (AffiliateLink) => {
        return AffiliateLinkRepository.prototype.schema.model(AffiliateLink)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AffiliateLinkRepository.prototype.schema.model.findById(_id)
            .populate(populate_affiliateLink)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }


    setAffiliate(_id, affiliateId){
        return new Promise( (resolve,reject) => {
            AffiliateLinkRepository.prototype.schema.model.findOneAndUpdate(
                { _id: _id },
                { $set: { "affiliate" : affiliateId} },
                { 'new': true })
            .exec( (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });

    }
    getAll = async() => {
        return new Promise( (resolve,reject) => {
            AffiliateLinkRepository.prototype.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

AffiliateLinkRepository.prototype.schema = new AffiliateLinkSchema();

export default AffiliateLinkRepository;