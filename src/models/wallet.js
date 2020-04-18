import {WalletLogic} from '../logic';
import {WalletsRepository} from '../db/repos';
import ModelComponent from './modelComponent';
import { UpdateMaxWithdrawSingleton } from "../controllers/Mapper";

class Wallet extends ModelComponent{

    constructor(params){

        let db = new WalletsRepository();

        super(
            {
                name : 'Wallet', 
                logic : new WalletLogic({db : db}), 
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

    async setMaxWithdraw(){
        try {
            let res = await this.process('UpdateMaxWithdraw');
            return UpdateMaxWithdrawSingleton.output('UpdateMaxWithdraw', res);
        }catch(err){
            throw err;
        }
    }

    async setMinWithdraw(){
        try {
            let res = await this.process('UpdateMinWithdraw');
            return res;
        }catch(err){
            throw err;
        }
    }

}

export default Wallet;