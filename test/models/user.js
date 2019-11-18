import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository} from '../db/repos';
import { MapperSingleton } from '../controllers/Mapper/Mapper';
import { Affiliate, Wallet } from '.';

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
                    new Wallet(params),
                    new Affiliate(params)
                ]
            }
            );
    }

    async login(){
        try{
            let res = await this.process('Login');
            return MapperSingleton.output('User', res);
        }catch(err){
            throw err;
        }
    }

    async register(){
        try{
            return await this.process('Register');
        }catch(err){
            throw err;
        }
    }

    async summary(){
        try{
            return await this.process('Summary');
        }catch(err){
            throw err;
        }
    }

    async updateWallet(){
        const { user } = this.self.params;
        try{
            /* Close Mutex */
            await UsersRepository.prototype.changeWithdrawPosition(user, true);
            let res = await this.process('UpdateWallet');
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
            return await this.process('FinalizeWithdraw');
        }catch(err){
            throw err;
        }
    }

     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async createAPIToken(){
        try{
            let res =  await this.process('CreateAPIToken');
            return res.bearerToken;
        }catch(err){
            throw err;
        }
    }

    async getBets(){
        try{
            return await this.process('GetBets');
        }catch(err){
            throw err;
        }
    }

}

export default User;
