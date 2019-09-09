import MongoComponent from './MongoComponent';
import { SecuritySchema } from '../schemas';

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


class SecurityRepository extends MongoComponent{

    constructor(){
        super(SecuritySchema)
    }
    /**
     * @function setWalletModel
     * @param Wallet Model
     * @return {Schema} WalletModel
     */

    setModel = (Wallet) => {
        return SecurityRepository.prototype.schema.model(Wallet)
    }

    async addSecret2FA(_id, secret){
        try{
            await SecurityRepository.prototype.schema.model.findOneAndUpdate(
                { _id: _id }, 
                { $set : { "2fa_secret" : secret, "2fa_set" : true } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){throw(err)}
                    return (item);
                }
            )
        }catch(err){
            throw err;
        }
    }

    async setBearerToken(_id, bearerToken){
        try{
            await SecurityRepository.prototype.schema.model.findOneAndUpdate(
                { _id: _id }, 
                { $set : { "bearerToken" : bearerToken } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){throw(err)}
                    return (item);
                }
            )
        }catch(err){
            throw err;
        }
    }

    
}

SecurityRepository.prototype.schema = new SecuritySchema();

export default SecurityRepository;