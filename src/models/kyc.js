import { KycLogic } from '../logic';
import { KycRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class Kyc extends ModelComponent{

    constructor(params){

        let db = new KycRepository();

        super(
            {
                name : 'Kyc', 
                logic : new KycLogic({db : db}), 
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

export default Kyc;