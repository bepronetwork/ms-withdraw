import {EcosystemLogic} from '../logic';
import ModelComponent from './modelComponent';

class Ecosystem extends ModelComponent{

    constructor(params){

        let db = null;

        super(
            {
                name : 'Ecosystem', 
                logic : new EcosystemLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : [ ]
            }
            );
    }
     
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */


    async getEcosystemData(){
        try{
            return await this.process('GetEcosystemData');
        }catch(err){
            throw err;
        }
    }

     
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */


    async getCasinoGames(){
        try{
            return await this.process('GetCasinoGames');
        }catch(err){
            throw err;
        }
    }

    
}

export default Ecosystem;
