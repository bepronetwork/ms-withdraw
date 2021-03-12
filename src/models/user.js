import { UserLogic } from '../logic';
import ModelComponent from './modelComponent';
class User extends ModelComponent {

    constructor(params) {
        super(
            {
                name: 'User',
                logic: new UserLogic({}),
                self: null,
                params: params
            }
        );
    }



    async finalizeWithdraw() {
        try {
            let res = await this.process('FinalizeWithdraw');
            return res;
        } catch (err) {
            throw err;
        }
    }

    async updateWallet() {
        try {
            let res = await this.process('UpdateWallet');
            return res;
        } catch (err) {
            throw err;
        }
    }

    async getDepositAddress() {
        // Output = Null
        // const { id } = this.self.params;
        try {
            /* Close Mutex */
            // await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, true);
            let res = await this.process('GetDepositAddress');
            /* Open Mutex */
            // await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, false);
            return res;
        } catch (err) {
            // if(parseInt(err.code) != 14){
            //     /* If not withdrawing atm */
            //     /* Open Mutex */
            //     await UsersRepository.prototype.changeWithdrawPositionGetAddress(id, false);
            // }
            throw err;
        }
    }

    async getTransactionsBackoffice() {
        try {
            let res = await this.process('GetTransactionsBackoffice');
            return res;
        } catch (err) {
            throw err;
        }
    }

    async getTransactions() {
        try {
            let res = await this.process('GetTransactions');
            return res;
        } catch (err) {
            throw err;
        }
    }

}

export default User;
