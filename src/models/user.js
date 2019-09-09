import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository} from '../db/repos';

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

    

    async requestWithdraw(){
        const { user, nonce } = this.self.params;
        try{
            /* Close Mutex */
            await UsersRepository.prototype.changeWithdrawPosition(user, true);
            let res = await this.process('RequestWithdraw');
            /* Open Mutex */
            await UsersRepository.prototype.changeWithdrawPosition(user, false);
            return res;
        }catch(err){
            if(parseInt(err.code) != 14){
                /* If not withdrawing atm */
                /* Open Mutex */
                await UsersRepository.prototype.changeWithdrawPosition(user, false);
            }
            throw err;
        }
    }

}

export default User;
