import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository, AppRepository} from '../db/repos';
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

    

    async requestWithdraw(){
        // Output = Null
        const { user } = this.self.params;
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

    async cancelWithdraw(){
        try{
            // Output = Boolean
            let res = await this.process('CancelWithdraw');
            return res;
        }catch(err){
            throw err;
        }
    }

    async requesAffiliatetWithdraw(){
        // Output = Null
        const { user } = this.self.params;
        try{
            /* Close Mutex */
            await UsersRepository.prototype.changeWithdrawPosition(user, true);
            let res = await this.process('RequestAffiliateWithdraw');
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

    
    async finalizeWithdraw(){
        const { app } = this.self.params;
        try{
            /* Close Mutex */
            await AppRepository.prototype.changeWithdrawPosition(app, true);
            let res = await this.process('FinalizeWithdraw');
             /* Open Mutex */
             await AppRepository.prototype.changeWithdrawPosition(app, false);
            return FinalizeWithdrawUserSingleton.output('FinalizeWithdrawUser', res);
        }catch(err){
            if(parseInt(err.code) != 14){
                /* If not withdrawing atm */
                /* Open Mutex */
                await AppRepository.prototype.changeWithdrawPosition(app, false);
            }
            throw err;
        }
    }

}

export default User;
