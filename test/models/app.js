import {AppLogic} from '../logic';
import ModelComponent from './modelComponent';
import {AppRepository} from '../db/repos';
import Wallet from './wallet';
import { MapperSingleton } from '../controllers/Mapper/Mapper';
import { AffiliateSetup } from '.';

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
                    new Wallet(params),
                    new AffiliateSetup({...params, 
                        structures : [
                            {
                                level : 1,
                                percentageOnLoss : 0.02
                            }
                        ]
                    })
                ]
            }
            );
    }
    
   
    /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    
    async register(){
        try{
            let app =  await this.process('Register');
            return MapperSingleton.output('App', app);
        }catch(err){
            throw err;
        }
    }

      /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    
    async get(){
        try{
            let app =  await this.process('Get');
            return MapperSingleton.output('App', app._doc);
        }catch(err){
            throw err;
        }
    }


      /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    
    async getAuth(){
        try{
            let app =  await this.process('Get');
            return MapperSingleton.output('AppAuth', app._doc);
        }catch(err){
            throw err;
        }
    }

   /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async summary(){
        try{
            return await this.process('Summary');
        }catch(err){
            throw err;
        }
    }

     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async getGames(){
        try{
            return await this.process('GetGames');
        }catch(err){
            throw err;
        }
    }
    
    /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async createAPIToken(){
        try{
            return await this.process('CreateAPIToken');
        }catch(err){
            throw err;
        }
    }

     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async addServices(){
        try{
            return await this.process('AddServices');
        }catch(err){
            throw err;
        }
    }


     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async addGame(){
        try{
            return await this.process('AddGame');
        }catch(err){
            throw err;
        }
    }


    /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async addBlockchainInformation(){
        try{
            return await this.process('AddBlockchainInformation');
        }catch(err){
            throw err;
        }
    }
    
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async getTransactions(){
        try{
            return await this.process('GetTransactions');
        }catch(err){
            throw err;
        }
    }

      /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async getLastBets(){
        try{
            return await this.process('GetLastBets');
        }catch(err){
            throw err;
        }
    }


      /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async getBiggestBetWinners(){
        try{
            return await this.process('GetBiggestBetWinners');
        }catch(err){
            throw err;
        }
    }

       /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async getBiggestUserWinners(){
        try{
            return await this.process('GetBiggestUserWinners');
        }catch(err){
            throw err;
        }
    }

       /**
     * @param {String}  
     * @return {bool || Exception}  
     */

    async getPopularNumbers(){
        try{
            return await this.process('GetPopularNumbers');
        }catch(err){
            throw err;
        }
    }

      
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async finalizeWithdraw(){
        try{
            return await this.process('FinalizeWithdraw');
        }catch(err){
            throw err;
        }
    }

     
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */


    async editGameTableLimit(){
        try{
            return await this.process('EditGameTableLimit');
        }catch(err){
            throw err;
        }
    }

     /**
     * @param {String} 
     * @return {bool || Exception}  
     */


    async editGameEdge(){
        try{
            return await this.process('EditGameEdge');
        }catch(err){
            throw err;
        }
    }

    /**
     * @param {String} 
     * @return {bool || Exception}  
     */


    async editAffiliateStructure(){
        try{
            return await this.process('EditAffiliateStructure');
        }catch(err){
            throw err;
        }
    }
     
     /**
     * @param {String} 
     * @return {bool || Exception}  
     */

    async updateWallet(){
        const { app } = this.self.params;
        try{
            /* Close Mutex */
            await AppRepository.prototype.changeWithdrawPosition(app, true);
            let res = await this.process('UpdateWallet');
            /* Open Mutex */
            await AppRepository.prototype.changeWithdrawPosition(app, false);
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
}

export default App;
