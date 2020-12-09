import MongoComponent from './MongoComponent';
import { UserSchema } from '../schemas/user';

import { 
    pipeline_bet_stats, 
    pipeline_financial_stats, 
    pipeline_user_wallet,
    pipeline_all_users_balance,
    pipeline_my_bets
} from './pipelines/user';
import { populate_user, populate_user_simple, populate_user_wallet } from './populates';
import { throwError } from '../../controllers/Errors/ErrorManager';
import populate_wallet_all from './populates/wallet/all';
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


const foreignKeys = ['wallet', 'app_id', 'withdraws', 'deposits'];

class UsersRepository extends MongoComponent{

    constructor(){
        super(UserSchema)
    }
    /**
     * @function setUserModel
     * @param User Model
     * @return {Schema} UserModel
     */

    setModel = (user) => {
        return UsersRepository.prototype.schema.model(user)
    }
    
    async findUserById(_id, populate_type=populate_user){
        switch(populate_type){
            case 'simple' : { populate_type=populate_user_simple; break; }
            case 'wallet' : { populate_type=populate_user_wallet; break; }
        }

        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.findById(_id)
                .populate(populate_type)
                .exec( (err, user) => {
                    if(err) { resolve(null)}
                    resolve(user);
                });
            });
        }catch(err){
            throw (err)
        }
    }

    updateMinBetAmountForBonusUnlocked(id, amount){
        return new Promise( (resolve, reject) => {
            WalletsRepository.prototype.schema.model.findByIdAndUpdate(id,
                { $inc : { minBetAmountForBonusUnlocked : parseFloat(amount) } } ,{ new: true }
            )
            .lean()
            .exec( (err, wallet) => {
                if(err) { reject(err)}
                resolve(wallet);
            });
        });
    }

    findByWallet(wallet){
        return new Promise( (resolve, reject) => {
            UsersRepository.prototype.schema.model.findOne(
                {"wallet._id": wallet})
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        })
    }

    findUserByIdAndApp(_id, app){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.findById({
                    _id: _id,
                    app_id: app
                })
                .populate([
                    {
                        path : 'wallet',
                        model : 'Wallet',
                        select : { '__v': 0},
                        populate : populate_wallet_all
                    }
                ])
                .lean()
                .exec( (err, user) => {
                    if(err) { resolve(null)}
                    resolve(user);
                });
            });
        }catch(err){
            throw (err)
        }
    }

    changeDepositPosition(_id, state){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.findByIdAndUpdate(
                    { _id: _id },
                    { $set: { "isDepositing" : state} })
                    .lean() 
                    .exec( (err, item) => {
                        if(err){reject(err)}
                        try{
                            if((state == true) && (item.isDepositing == true)){throwError('DEPOSIT_MODE_IN_API')}
                            resolve(item);
                        }catch(err){
                            reject(err);
                        }

                    }
                )
            })
        }catch(err){
            throw (err)
        }
    }

    getBets({id, size=15}){ 
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model
                .aggregate(pipeline_my_bets(id))
                .exec( (err, data) => {
                    if(err) { reject(err)}
                    resolve(data.slice(0, size));
                });
            });
        }catch(err){
            throw err
        }
    }
   

    findUser(username){
        return new Promise( (resolve, reject) => {
            UsersRepository.prototype.schema.model.findOne({'username' : username})
            .populate(foreignKeys)
            .lean()
            .exec( (err, user) => {
                if(err) {reject(err)}
                resolve(user);
            });
        });
    }

    addDeposit(user_id, deposit){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findOneAndUpdate(
                { _id: user_id, deposits : {$nin : [deposit._id] } }, 
                { $push: { "deposits" : deposit } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }
    
    addWithdraw(user_id, withdraw){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findOneAndUpdate(
                { _id: user_id, withdraws : {$nin : [withdraw] } }, 
                { $push: { "withdraws" : withdraw } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }

    removeWithdraw(user_id, withdraw){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findOneAndUpdate(
                { _id: user_id }, 
                { $pull: { "withdraws" : withdraw } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }
    
    addBet(user_id, bet){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findOneAndUpdate(
                { _id: user_id, bets : {$nin : [bet._id] } }, 
                { $push: { "bets" : bet } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(true);
                }
            )
        });
    }

    getAll = async() => {
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.find().lean().populate(foreignKeys)
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }


    async getAllUsersBalance({app, currency}){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model
                .aggregate(pipeline_all_users_balance(app, currency))
                .exec( (err, item) => {
                    if(err) { reject(err)}
                    var res;
                    if(!item || !item[0]){ res = { balance : 0} }
                    else{res = item[0]}
                    resolve(res);
                });
            })
        }catch(err){
            throw err;
            throw err;
        }
        
    }

    async changeWithdrawPosition(_id, state){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.findByIdAndUpdate(
                    _id,
                    { $set: { "isWithdrawing" : state} }) 
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
            })
        }catch(err){
            throw (err)
        }
    }


    async findUserByExternalId(external_id){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.find({external_id : external_id})
                .populate(foreignKeys)
                .exec( (err, user) => {
                    if(err) { reject(err)}
                    resolve(user);
                });
            });
        }catch(err){
            throw (err)
        }
    }

    createAPIToken(user_id, bearerToken){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findByIdAndUpdate(
                user_id, 
                { $set: { "bearerToken" : new String(bearerToken) } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    async findUserByAddress({address, app}){
        try{
            return new Promise( (resolve, reject) => {
                UsersRepository.prototype.schema.model.find(
                    { $and: [ { address: address}, { app_id: app} ] })
                .populate(foreignKeys)
                .exec( (err, users) => {
                    if(err) { reject(err)}
                    var res;
                    if(users.length > 0) {res = users};
                    if(users.length == 0) {res = null}
                    resolve(res);
                });
            });
        }catch(err){
            throw (err)
        }
    }

    addCurrencyWallet(user_id, wallet){
        return new Promise( (resolve,reject) => {
            UsersRepository.prototype.schema.model.findOneAndUpdate(
                { _id: user_id, wallet : {$nin : [wallet._id] } }, 
                { $push: { "wallet" : wallet} },
                { 'new': true })
                .lean()
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }


    async getSummaryStats(type, _id){ 

        let pipeline;

        /**
         * @input Type
         * @output Pipeline
         */

        switch (new String(type).toUpperCase().trim()){
            case 'FINANCIAL' : pipeline = pipeline_financial_stats; break;
            case 'BETS' : pipeline = pipeline_bet_stats; break;
            case 'WALLET' : pipeline = pipeline_user_wallet; break;
            default : throw new Error(` Type : ${type} is not accepted as a Summary Type API Call`);
        }

        return new Promise( (resolve, reject) => {
            UsersRepository.prototype.schema.model
            .aggregate(pipeline(_id))
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }
}

UsersRepository.prototype.schema = new UserSchema();

export default UsersRepository;