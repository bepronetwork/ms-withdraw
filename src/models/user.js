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

    async verifyIfIsAutoWithdraw(){
        try{
            let res = await this.process('VerifyIfIsAutoWithdraw');
            return res;
        }catch(err){
            throw err;
        }
    }

    async verifyMaxWithdrawAmountCumulative(){
        try{
            let res = await this.process('VerifyMaxWithdrawAmountCumulative');
            return res;
        }catch(err){
            throw err;
        }
    }

    async verifyMaxWithdrawAmountPerTransaction(){
        try{
            let res = await this.process('VerifyMaxWithdrawAmountPerTransaction');
            return res;
        }catch(err){
            throw err;
        }
    }

    async verifyEmailConfirmed(){
        try{
            let res = await this.process('VerifyEmailConfirmed');
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
        try{
            let res = await this.process('FinalizeWithdraw');
            return FinalizeWithdrawUserSingleton.output('FinalizeWithdrawUser', res);
        }catch(err){
            throw err;
        }
    }

}

export default User;
