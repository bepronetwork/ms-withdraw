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

}

export default Withdraw;