import MongoComponent from './MongoComponent';
import { CurrencySchema } from '../schemas';

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


class CurrencyRepository extends MongoComponent{

    constructor(){
        super(TokenSchema)
    }
    /**
     * @function setCurrencyModel
     * @param Currency Model
     * @return {Schema} CurrencyModel
     */

    setModel = (Currency) => {
        return this.schema.model(Currency)
    }

    async findById(_id){ 
        return new Promise( (resolve, reject) => {
            this.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
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

CurrencyRepository.prototype.schema = new CurrencySchema();

export default CurrencyRepository;