import {GameLogic} from '../logic';
import ModelComponent from './modelComponent';
import {GamesRepository} from '../db/repos';

class Game extends ModelComponent{

    constructor(params){

        let db = new GamesRepository();

        super(
            {
                name : 'Game', 
                logic : new GameLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
            }
            );
    }
    
   
    /**
     * @param {String} GameName
     * @param {String} unverifiedPassword
     * @return {bool || Exception}  
     */

    
    async register(){
        try{
            return await this.process('Register');
        }catch(err){
            throw err;
        }
    }

    /**
     * @param {String} GameName
     * @param {String} unverifiedPassword
     * @return {bool || Exception}  
     */

    
    async get(){
        try{
            return await this.process('Get');
        }catch(err){
            throw err;
        }
    }

}

export default Game;
