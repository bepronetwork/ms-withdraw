import {AppLogic} from '../logic';
import ModelComponent from './modelComponent';
import {AppRepository} from '../db/repos';
import { FinalizeWithdrawAppSingleton } from '../controllers/Mapper';
// const saveOutputTest = require('../../test/outputTest/configOutput')

class App extends ModelComponent{

    constructor(params){

        let db = new AppRepository();

        super(
            {
                name : 'App', 
                logic : new AppLogic({db : db}), 
                db : db,
                self : null, 
                params : params,
                children : [
                ]
            }
            );
    }
    
    
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async requestWithdraw(){
        const { app } = this.self.params;
        try{
            /* Close Mutex */
            await AppRepository.prototype.changeWithdrawPosition(app, true);
            let res = await this.process('RequestWithdraw');
            /* Open Mutex */
            await AppRepository.prototype.changeWithdrawPosition(app, false);
            // saveOutputTest.saveOutputTest(`APPTest`,`requestWithdraw`,res);
            return res;
        }catch(err){
            if(parseInt(err.code) != 14){
                /* If not withdrawing atm */
                /* Open Mutex */
                await AppRepository.prototype.changeWithdrawPosition(app, false);
            }
            throw err;
        }
    }

         /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async finalizeWithdraw(){
        try{
            let res = await this.process('FinalizeWithdraw');
            return FinalizeWithdrawAppSingleton.output('FinalizeWithdrawApp', res);
        }catch(err){
            throw err;
        }
    }

    async getUserWithdraws(){
        try{
            let res = await this.process('GetUsersWithdraws');
            // saveOutputTest.saveOutputTest(`APPTest`,`getUserWithdraws`,res);
            return res;
        }catch(err){
            throw err;
        }
    }
}

export default App;
