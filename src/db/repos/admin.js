import { AdminSchema } from '../schemas';
import { populate_admin } from './populates';

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


const foreignKeys = ['app', 'security'];

class AdminsRepository{

    constructor(){
    }
    /**
     * @function setAdminModel
     * @param Admin Model
     * @return {Schema} AdminModel
     */

    setModel = (user) => {
        return AdminSchema.prototype.schema.model(user)
    }
    
    async findAdminById(_id){ 
        try{
            return new Promise( (resolve, reject) => {
                AdminSchema.prototype.schema.model.findById(_id)
                .populate(populate_admin)
                .lean()
                .exec( (err, user) => {
                    if(err) { reject(err)}
                    resolve(user);
                });
            });
        }catch(err){
            throw (err)
        }
    }

    findAdmin(username){
        return new Promise( (resolve, reject) => {
            AdminSchema.prototype.schema.model.findOne({'username' : username})
            .populate(populate_admin)
            .lean()
            .exec( (err, user) => {
                if(err) {reject(err)}
                resolve(user);
            });
        });
    }

    addApp(admin_id, app){
        return new Promise( (resolve,reject) => {
            AdminSchema.prototype.schema.model.findByIdAndUpdate(
                admin_id , 
                { $set : { "app" : app } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }
}

AdminSchema.prototype.schema = new AdminSchema();


export default AdminsRepository;