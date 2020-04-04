import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository} from '../db/repos';
import { FinalizeWithdrawUserSingleton } from '../controllers/Mapper';

class User extends ModelComponent{

    constructor(params){

        let db = new UsersRepository();

        super(
            {
                name : 'User', 
                logic : new UserLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : [

                ]
            }
            );
    }
    
    async finalizeWithdraw(){
        try{
            let res = await this.process('FinalizeWithdraw');
            return FinalizeWithdrawUserSingleton.output('FinalizeWithdrawUser', res);
        }catch(err){
            throw err;
        }
    }

}

export default User;
