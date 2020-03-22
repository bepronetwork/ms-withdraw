import { PermissionLogic } from '../logic';
import { PermissionRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class Permission extends ModelComponent{

    constructor(params){

        let db = new PermissionRepository();

        super(
            {
                name : 'Permission', 
                logic : new PermissionLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : []
            }
            );
    }

    async register(){
        try{
            return await this.process('Register');
        }catch(err){
            throw err;
        }
    }
}

export default Permission;