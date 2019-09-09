import {DepositLogic} from '../logic';
import ModelComponent from './modelComponent';
import {DepositRepository} from '../db/repos';
import { MapperSingleton } from '../controllers/Mapper/Mapper';
import Wallet from './wallet';

class Deposit extends ModelComponent{

    constructor(params){

        let db = new DepositRepository();

        super(
            {
                name : 'Deposit', 
                logic : new DepositLogic({db : db}), 
                db : db,
                self : null, 
                params : params
            }
            );
    }

    async createDeposit(){
        try{
            let response = await this.process('CreateDeposit')
            return response;
        }catch(err){
            throw err;
        } 
    }

}

export default Deposit;