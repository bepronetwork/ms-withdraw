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

    async updateWallet() {
        // No Output
        const { id } = this.self.params;
        console.log("UserId:: ", id)
        try {
            await UsersRepository.prototype.changeDepositPosition(id, true);
            let res = await this.process('UpdateWallet');
            UsersRepository.prototype.changeDepositPosition(id, false);
            return res;
        } catch (err) {
            console.log("Error Code: ",err.code)
            if(parseInt(err.code) != 82){
                console.log("NO ERROR MUTEX")
                console.log(err.data)
                /* If not depositing atm */
                /* Open Mutex */
                UsersRepository.prototype.changeDepositPosition(id, false);
            }
            throw err;
        }
    }
    
    async getDepositAddress() {
        const { app } = this.self.params;
        /* Mutex In */
        try{
            let res = await this.process('GetDepositAddress');
            return res;
        }catch(err){
            throw err;
        }
    }

    async getTransactions() {
        try{
            let res = await this.process('GetTransactions');
            return res;
        }catch(err){
            throw err;
        }
    }

}

export default User;
