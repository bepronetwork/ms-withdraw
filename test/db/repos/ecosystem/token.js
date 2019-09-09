import MongoComponent from '../MongoComponent';
import { TokenSchema } from '../../schemas/ecosystem/token';

/**
 * Accounts database interaction class.
 *
 * @class
 * @memberof db.repos.accounts
 * @requires bluebird    async getAll(){

 * @requires lodash
 * @requires db/sql.accounts
 * @see Parent: {@link db.repos.accounts}
 */


class TokensRepository extends MongoComponent{

    constructor(){
        super(TokenSchema)
    }
    /**
     * @function setTokenModel
     * @param Token Model
     * @return {Schema} TokenModel
     */

    setModel = (Token) => {
        return this.schema.model(Token)
    }

  
    async getAll(){
        return new Promise( (resolve,reject) => {
            this.schema.model.find().lean().populate()
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

TokensRepository.prototype.schema = new TokenSchema();

export default TokensRepository;