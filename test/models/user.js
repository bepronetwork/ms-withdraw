import {UserLogic} from '../logic';
import ModelComponent from './modelComponent';
import {UsersRepository} from '../db/repos';
import Wallet from './wallet';
import { MapperSingleton } from '../controllers/Mapper/Mapper';

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
                    new Wallet(params)
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
        try{
            return await this.process('UpdateWallet');
        }catch(err){
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
            let res = await this.process('CreateAPIToken');
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
