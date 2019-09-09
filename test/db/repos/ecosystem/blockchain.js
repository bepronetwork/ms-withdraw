import MongoComponent from '../MongoComponent';
import { BlockchainSchema } from '../../schemas/ecosystem/blockchain';

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


class BlockchainsRepository extends MongoComponent{

    constructor(){
        super(BlockchainSchema)
    }
    /**
     * @function setBlockchainModel
     * @param Blockchain Model
     * @return {Schema} BlockchainModel
     */

    setModel = (Blockchain) => {
        return this.schema.model(Blockchain)
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

BlockchainsRepository.prototype.schema = new BlockchainSchema();

export default BlockchainsRepository;