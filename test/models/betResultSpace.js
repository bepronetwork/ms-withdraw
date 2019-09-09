import {BetResultSpaceLogic} from '../logic';
import ModelComponent from './modelComponent';
import {BetResultSpacesRepository} from '../db/repos';

class BetResultSpace extends ModelComponent{

    constructor(params){

        let db = new BetResultSpacesRepository();

        super(
            {
                name : 'BetResultSpace', 
                logic : new BetResultSpaceLogic({db : db}), 
                db : db,
                self : null, 
                params : params
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

export default BetResultSpace;