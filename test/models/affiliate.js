import { AffiliateLogic } from '../logic';
import { AffiliateRepository } from '../db/repos';
import ModelComponent from './modelComponent';
import { Wallet } from '.';

class Affiliate extends ModelComponent{

    constructor(params){

        let db = new AffiliateRepository();

        super(
            {
                name : 'Affiliate', 
                logic : new AffiliateLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : [
                    new Wallet(params)
                ]
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

export default Affiliate;