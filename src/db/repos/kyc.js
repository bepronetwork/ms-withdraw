import MongoComponent from './MongoComponent';
import { KycSchema } from '../schemas';

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


class KycRepository extends MongoComponent{

    constructor(){
        super(KycSchema)
    }
    /**
     * @function setKycModel
     * @param Kyc Model
     * @return {Schema} KycModel
     */

    setModel = (Kyc) => {
        return KycRepository.prototype.schema.model(Kyc)
    }

    findByIdAndUpdate(_id, data){
        return new Promise( (resolve,reject) => {
            KycRepository.prototype.schema.model.findByIdAndUpdate(
                {_id},
                {
                    $set: data
                },
                { 'new': true })
                .lean()
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

}

KycRepository.prototype.schema = new KycSchema();

export default KycRepository;