import MongoComponent from './MongoComponent';
import { PermissionSchema } from '../schemas';

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


class PermissionRepository extends MongoComponent{

    constructor(){
        super(PermissionSchema)
    }
    /**
     * @function setChatModel
     * @param Permission Model
     * @return {Schema} PermissionModel
     */

    setModel = (Permission) => {
        return PermissionRepository.prototype.schema.model(Permission)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            PermissionRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, newStructure){ 
        return new Promise( (resolve, reject) => {
            PermissionRepository.prototype.schema.model.findByIdAndUpdate(
                _id,
                { $set: {
                    "super_admin"  : newStructure.super_admin,
                    "customization"  : newStructure.customization,
                    "withdraw"  : newStructure.withdraw,
                    "userWithdraw"  : newStructure.userWithdraw,
                    "financials"  : newStructure.financials,
                }} 
                )
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }
}

PermissionRepository.prototype.schema = new PermissionSchema();

export default PermissionRepository;