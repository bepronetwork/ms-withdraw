import {AppLogic} from '../logic';
import ModelComponent from './modelComponent';
import {AppRepository} from '../db/repos';
import { FinalizeWithdrawAppSingleton, RequestWithdrawAppSingleton, GetUsersWithdrawsSingleton } from '../controllers/Mapper';
import { MapperUpdateWalletSingleton } from '../controllers/Mapper/App';

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
    
    async addCurrencyWallet() {
        try {
            let app = await this.process('AddCurrencyWallet');
            return app;
        } catch (err) {
            throw err;
        }
    }

}

export default App;
