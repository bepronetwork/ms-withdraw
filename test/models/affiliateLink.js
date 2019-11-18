import {AffiliateLinkLogic} from '../logic';
import {AffiliateLinkRepository} from '../db/repos';
import ModelComponent from './modelComponent';
import { Wallet } from '.';

class AffiliateLink extends ModelComponent{

    constructor(params){

        let db = new AffiliateLinkRepository();

        super(
            {
                name : 'AffiliateLink', 
                logic : new AffiliateLinkLogic({db : db}), 
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

export default AffiliateLink;