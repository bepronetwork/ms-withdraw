import MongoComponent from './MongoComponent';
import { AppSchema } from '../schemas';
import { 
    pipeline_revenue_stats, 
    pipeline_user_stats, 
    pipeline_bet_stats, 
    pipeline_game_stats, 
    pipeline_app_wallet,
    pipeline_get_by_external_id,
    pipeline_last_bets,
    pipeline_biggest_bet_winners,
    pipeline_biggest_user_winners,
    pipeline_popular_numbers
} from './pipelines/app';

import { 
    populate_app_all,
    populate_app_affiliates,
    populate_app_game,
    populate_app_auth,
    populate_app_simple,
    populate_app_wallet,
    populate_app_address,
    populate_app_add_currency_wallet
} from './populates';
import { throwError } from '../../controllers/Errors/ErrorManager';


let foreignKeys = ['wallet', 'users', 'games'];

/**
 * Accounts database interaction class.
 *
 * @class
 * @memberof db.repos.accounts
 * @requires bluebird
 * @requires lodash
 * @requires db/sql.accounts
 * @see Parent: {@link db.repos.accounts}
 */


class AppRepository extends MongoComponent{

    constructor(){
        super(AppSchema)
    }
    /**
     * @function setAppModel
     * @param App Model
     * @return {Schema} AppModel
     */

    setModel = (App) => {
        return AppRepository.prototype.schema.model(App)
    }

    addGame(app_id, game){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, games : {$nin : [game._id] } }, 
                { $push: { "games" : game } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }

    addCurrency(app_id, currency){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, currencies : {$nin : [currency._id] } }, 
                { $push: { "currencies" : currency} },
                { 'new': true })
                .lean()
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    addUser(app_id, user){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, users : {$nin : [user._id] } }, 
                { $push: { "users" : user, "external_users" : user.external_id} },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    addBlockchainInformation(app_id, params){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findByIdAndUpdate(
                app_id, 
                { $set: { 
                    "currencyTicker" : params.currencyTicker,
                    "decimals"      : params.decimals,
                    "ownerAddress"   : new String(params.ownerAddress).trim(),
                    "authorizedListAddress"   : params.authorizedListAddress,
                    "authorizedAddress"   : new String(params.authorizedAddress).trim(),
                    "platformAddress" : new String(params.platformAddress).trim(),
                    "platformBlockchain" :  new String(params.platformBlockchain).trim(),
                    "platformTokenAddress" : new String(params.platformTokenAddress).trim()
                } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    addDeposit(app_id, deposit){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, deposits : {$nin : [deposit._id] } }, 
                { $push: { "deposits" : deposit } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    getLastBets({id, size=15}){ 
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model
                .aggregate(pipeline_last_bets(id))
                .exec( (err, data) => {
                    if(err) { reject(err)}
                    resolve(data.slice(0, size));
                });
            });
        }catch(err){
            throw err
        }
    }

    getPopularNumbers({id, size=5}){ 
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model
                .aggregate(pipeline_popular_numbers(id))
                .exec( (err, data) => {
                    if(err) { reject(err)}
                    resolve(data.slice(0, size));
                });
            });
        }catch(err){
            throw err
        }
    }

    getBiggestBetWinners({id, size=15}){ 
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model
                .aggregate(pipeline_biggest_bet_winners(id))
                .exec( (err, data) => {
                    if(err) { reject(err)}
                    resolve(data.slice(0, size));
                });
            });
        }catch(err){
            throw err
        }
    }

    getBiggestUserWinners({id, size=15}){ 
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model
                .aggregate(pipeline_biggest_user_winners(id))
                .exec( (err, data) => {
                    if(err) { reject(err)}
                    resolve(data.slice(0, size));
                });
            });
        }catch(err){
            throw err
        }
    }

    findAppById(_id, populate_type=populate_app_all){
        let type = populate_type;
        switch(populate_type){
            case 'get_game' : { populate_type = populate_app_game; break; }
            case 'get_app_auth' : { populate_type = populate_app_auth; break; }
            case 'affiliates' : { populate_type = populate_app_affiliates; break; }
            case 'simple' : { populate_type = populate_app_simple; break; }
            case 'wallet' : { populate_type = populate_app_wallet; break; }
            case 'address' : { populate_type = populate_app_address; break; }
            case 'none' : { populate_type = []; break; }
        }

        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model.findById(_id)
                .populate(populate_type)
                .exec( (err, App) => {
                    if(err) { reject(err)}
                    resolve(App);
                });
            });
        }catch(err){
            throw err;
        }
    }

    findAppByIdNotPopulated(_id){ 
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model.findById(_id)
                .exec( (err, App) => {
                    if(err) { reject(err)}
                    resolve(App);
                });
            });
        }catch(err){
            throw err
        }
    }


    async addServices(app_id, services){
        try{
            await AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, services : {$nin : services } }, 
                { $set : { "services" : services } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){throw(err)}
                    return (true);
                }
            )
        }catch(err){
            throw err;
        }
    }

  
    findUserByExternalId(app_id, user_external_id){
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model
                .aggregate(pipeline_get_by_external_id(app_id,user_external_id))
                .exec( (err, user) => {
                    if(err) { reject(err)}
                    let ret;
                    if(user.length == 0){ ret = null; }else{
                        ret = user[0].user;
                    }
                    resolve(ret);
                });
            });
        }catch(err){
            throw err
        }
    }


    async changeWithdrawPosition(_id, state){
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model.findByIdAndUpdate(
                    { _id: _id}, 
                    { $set:  {  isWithdrawing : state} } )
                    .exec( (err, item) => {
                        if(err){reject(err)}
                        try{
                            if((state == true) && (item.isWithdrawing == true)){throwError('WITHDRAW_MODE_IN_API')}
                            resolve(item);
                        }catch(err){
                            reject(err);
                        }

                    }
                )
            });
        }catch(err){
            throw (err)
        }
    }

    addWithdraw(id, withdraw){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: id, withdraws : {$nin : [withdraw] } }, 
                { $push: { "withdraws" : withdraw } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }

    async setIntegrationsId(app_id, integrations_id){
        try{
            await AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id }, 
                { $set : { "integrations" : integrations_id } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){throw(err)}
                    return (item);
                }
            )
        }catch(err){
            throw err;
        }
    }


    removeWithdraw(id, withdraw){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: id }, 
                { $pull: { "withdraws" : withdraw } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }


    findApp = (App_name) => {
        return new Promise( (resolve, reject) => {
            AppRepository.prototype.schema.model.findOne({'name' : App_name})
            .exec( (err, App) => {
                if(err) {reject(err)}
                resolve(App);
            });
        });
    }

    /**
     * 
     * @param {Mongoose Id} _id 
     */

    async getSummaryStats(type, _id, { dates }){ 

        let pipeline;

        /**
         * @input Type
         * @output Pipeline
         */

        switch (type){
            case 'users' : pipeline = pipeline_user_stats; break;
            case 'games' : pipeline = pipeline_game_stats; break;
            case 'revenue' : pipeline = pipeline_revenue_stats; break;
            case 'bets' : pipeline = pipeline_bet_stats; break;
            case 'wallet' : pipeline = pipeline_app_wallet; break;
            default : throw new Error(` Type : ${type} is not accepted as a Summary Type API Call`);
        }

        return new Promise( (resolve, reject) => {
            AppRepository.prototype.schema.model
            .aggregate(pipeline(_id, { dates }))
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    addCurrencyWallet(app_id, wallet){
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.findOneAndUpdate(
                { _id: app_id, wallet : {$nin : [wallet._id] } }, 
                { $push: { "wallet" : wallet._id} },
                { 'new': true })
                .lean()
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    findAppByIdAddCurrencyWallet(_id){
        try{
            return new Promise( (resolve, reject) => {
                AppRepository.prototype.schema.model.findById(_id, {
                    '_id': 1,
                    'currencies': 1,
                    'games': 1,
                    'users': 1,
                    'wallet': 1,
                    'addOn': 1,
                    'virtual': 1
                })
                .populate(populate_app_add_currency_wallet)
                .exec( (err, App) => {
                    if(err) { reject(err)}
                    resolve(App);
                });
            });
        }catch(err){
            throw err;
        }
    }

    getAll = async() => {
        return new Promise( (resolve,reject) => {
            AppRepository.prototype.schema.model.find().lean().populate(foreignKeys)
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

AppRepository.prototype.schema = new AppSchema();

export default AppRepository;