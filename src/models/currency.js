import { CurrencyLogic } from '../logic';
import { CurrencyRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class Currency extends ModelComponent{

    constructor(params){

        let db = new CurrencyRepository();

        super(
            {
                name : 'Currency', 
                logic : new CurrencyLogic({db : db}), 
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
}

export default Currency;