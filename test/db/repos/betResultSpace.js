import MongoComponent from './MongoComponent';
import { BetResultSpaceSchema } from '../schemas';
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

class BetResultSpacesRepository extends MongoComponent{

    constructor(){
        super(BetResultSpaceSchema)
    }
    /**
     * @function setBetResultSpaceModel
     * @param BetResultSpace Model
     * @return {Schema} BetResultSpaceModel
     */

    setModel = (bet) => {
        return BetResultSpacesRepository.prototype.schema.model(bet)
    }

    findBetResultSpaceById(_id){ 
        return new Promise( (resolve, reject) => {
            BetResultSpacesRepository.prototype.schema.model.findById(_id)
            .exec( (err, BetResultSpace) => {
                if(err) { reject(err)}
                resolve(BetResultSpace);
            });
        });
    }

}

BetResultSpacesRepository.prototype.schema = new BetResultSpaceSchema();

export default BetResultSpacesRepository;