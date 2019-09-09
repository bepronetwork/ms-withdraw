import {WithdrawLogic} from '../logic';
import ModelComponent from './modelComponent';
import {WithdrawRepository} from '../db/repos';

class Withdraw extends ModelComponent{

    constructor(params){

        let db = new WithdrawRepository();

        super(
            {
                name : 'Withdraw', 
                logic : new WithdrawLogic({db : db}), 
                db : db,
                self : null, 
                params : params
            }
            );
    }

    
    async createWithdraw(){
        try{
            let response = await this.process('CreateWithdraw')
            return response;
        }catch(err){
            throw err;
        } 
    }

}

export default Withdraw;