import MongoComponent from './MongoComponent';
import { ResultSpaceSchema } from '../schemas';
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


const foreignKeys = [];

class ResultSpacesRepository extends MongoComponent{

    constructor(){
        super(ResultSpaceSchema)
    }
    /**
     * @function setResultSpaceModel
     * @param ResultSpace Model
     * @return {Schema} ResultSpaceModel
     */

    setModel = (bet) => {
        return ResultSpacesRepository.prototype.schema.model(bet)
    }

    findResultSpaceById(_id){ 
        return new Promise( (resolve, reject) => {
            ResultSpacesRepository.prototype.schema.model.findById(_id)
            .exec( (err, ResultSpace) => {
                if(err) { reject(err)}
                resolve(ResultSpace);
            });
        });
    }

}

ResultSpacesRepository.prototype.schema = new ResultSpaceSchema();

export default ResultSpacesRepository;