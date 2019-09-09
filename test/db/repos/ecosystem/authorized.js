import MongoComponent from '../MongoComponent';
import { AuthorizedSchema } from '../../schemas/ecosystem/authorized';

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


class AuthorizedsRepository extends MongoComponent{

    constructor(){
        super(AuthorizedSchema)
    }

    /**
     * @function setAuthorizedModel
     * @param Authorized Model
     * @return {Schema} AuthorizedModel
     */

    setModel = (Authorized) => {
        return this.schema.model(Authorized)
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

AuthorizedsRepository.prototype.schema = new AuthorizedSchema();

export default AuthorizedsRepository;