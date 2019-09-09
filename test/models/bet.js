import {BetLogic} from '../logic';
import ModelComponent from './modelComponent';
import {BetsRepository} from '../db/repos';
import { isCasino } from '../logic/markets/betSystems';

class Bet extends ModelComponent{

    constructor(params){

        let db = new BetsRepository();

        super(
            {
                name : 'Bet', 
                logic : new BetLogic({db : db}), 
                db : db,
                self : null, 
                params : params
            }
            );
    }

    async register(){
        try{
            let res = await this.process('Auto');
            if(isCasino(res.betSystem)){
                /* if(res.hasJackpot){
                    // Auto Jackpot
                    let res_playJackpot = await this.process('PlayAutoJackpot');
                    res.jackpot = res_playJackpot;
                }*/
            }
            return res;
        }catch(err){
            throw err;
        }
    } 
    
    async resolve(){
        try{
            return await this.process('Resolve');
        }catch(err){
            throw err;
        }
    } 

}

export default Bet;