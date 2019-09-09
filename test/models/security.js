import { SecurityLogic } from '../logic';
import { SecurityRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class Security extends ModelComponent{

    constructor(params){

        let db = new SecurityRepository();

        super(
            {
                name : 'Security', 
                logic : new SecurityLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : []
            }
            );
    }

    async register(){
        try{
            await this.process('Register');
        }catch(err){
            throw err;
        }
    }
}

export default Security;