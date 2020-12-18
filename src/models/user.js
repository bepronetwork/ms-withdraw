import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository} from '../db/repos';
class User extends ModelComponent{

    constructor(params){
        super(
            {
                name : 'User', 
                logic : new UserLogic({}),
                self : null, 
                params : params
            }
            );
    }

    

    // async requestWithdraw(){
    //     // Output = Null
    //     const { user } = this.self.params;
    //     try{
    //         /* Close Mutex */
    //         await UsersRepository.prototype.changeWithdrawPosition(user, true);
    //         let res = await this.process('RequestWithdraw');
    //         /* Open Mutex */
    //         await UsersRepository.prototype.changeWithdrawPosition(user, false);
    //         return res;
    //     }catch(err){
    //         if(parseInt(err.code) != 14){
    //             /* If not withdrawing atm */
    //             /* Open Mutex */
    //             await UsersRepository.prototype.changeWithdrawPosition(user, false);
    //         }
    //         throw err;
    //     }
    // }

    // async updateWallet() {
    //     // No Output
    //     const { id } = this.self.params;
    //     console.log("UserId:: ", id)
    //     try {
    //         await UsersRepository.prototype.changeDepositPosition(id, true);
    //         let res = await this.process('UpdateWallet');
    //         UsersRepository.prototype.changeDepositPosition(id, false);
    //         return res;
    //     } catch (err) {
    //         console.log("Error Code: ",err.code)
    //         if(parseInt(err.code) != 82){
    //             console.log("NO ERROR MUTEX")
    //             console.log(err.data)
    //             /* If not depositing atm */
    //             /* Open Mutex */
    //             UsersRepository.prototype.changeDepositPosition(id, false);
    //         }
    //         throw err;
    //     }
    // }

    // async cancelWithdraw(){
    //     const { app } = this.self.params;
    //     try{
    //         /* Close Mutex */
    //         await AppRepository.prototype.changeWithdrawPosition(app, true);
    //         // Output = Boolean
    //         let res = await this.process('CancelWithdraw');
    //         /* Open Mutex */
    //         await AppRepository.prototype.changeWithdrawPosition(app, false);
    //         return res;
    //     }catch(err){
    //         if(parseInt(err.code) != 14){
    //             /* If not withdrawing atm */
    //             /* Open Mutex */
    //             await AppRepository.prototype.changeWithdrawPosition(app, false);
    //         }
    //         throw err;
    //     }
    // }
    
    async getDepositAddress() {
        // Output = Null
        // const { id } = this.self.params;
        try{
            /* Close Mutex */
            // await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, true);
            let res = await this.process('GetDepositAddress');
            /* Open Mutex */
            // await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, false);
            return res;
        }catch(err){
            // if(parseInt(err.code) != 14){
            //     /* If not withdrawing atm */
            //     /* Open Mutex */
            //     await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, false);
            // }
            throw err;
        }
    }

    // async getTransactions() {
    //     try{
    //         let res = await this.process('GetTransactions');
    //         return res;
    //     }catch(err){
    //         throw err;
    //     }
    // }

}

export default User;
