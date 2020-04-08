import MongoComponent from './MongoComponent';
import { AutoWithdrawSchema } from '../schemas';

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


class AutoWithdrawRepository extends MongoComponent{

    constructor(){
        super(AutoWithdrawSchema)
    }
    /**
     * @function setChatModel
     * @param AutoWithdraw Model
     * @return {Schema} PermissionModel
     */

    setModel = (AutoWithdraw) => {
        return AutoWithdrawRepository.prototype.schema.model(AutoWithdraw)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            AutoWithdrawRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }
}

AutoWithdrawRepository.prototype.schema = new AutoWithdrawSchema();

export default AutoWithdrawRepository;