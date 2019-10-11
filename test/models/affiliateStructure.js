import { AffiliateStructureLogic } from '../logic';
import { AffiliateStructureRepository } from '../db/repos';
import ModelComponent from './modelComponent';

class AffiliateStructure extends ModelComponent{

    constructor(params){

        let db = new AffiliateStructureRepository();

        super(
            {
                name : 'AffiliateStructure', 
                logic : new AffiliateStructureLogic({db : db}), 
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

export default AffiliateStructure;