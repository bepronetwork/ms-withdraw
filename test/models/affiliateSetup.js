import { AffiliateSetupLogic } from '../logic';
import { AffiliateSetupRepository } from '../db/repos';
import ModelComponent from './modelComponent';
import { Wallet } from '.';

class AffiliateSetup extends ModelComponent{

    constructor(params){

        let db = new AffiliateSetupRepository();

        super(
            {
                name : 'AffiliateSetup', 
                logic : new AffiliateSetupLogic({db : db}), 
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

export default AffiliateSetup;