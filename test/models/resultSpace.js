import {ResultSpaceLogic} from '../logic';
import ModelComponent from './modelComponent';
import {ResultSpacesRepository} from '../db/repos';

class ResultSpace extends ModelComponent{

    constructor(params){

        let db = new ResultSpacesRepository();

        super(
            {
                name : 'ResultSpace', 
                logic : new ResultSpaceLogic({db : db}), 
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

export default ResultSpace;