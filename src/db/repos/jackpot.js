import MongoComponent from './MongoComponent';
import { JackpotSchema } from '../schemas';

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


class JackpotRepository extends MongoComponent{

    constructor(){
        super(JackpotSchema)
    }
    /**
     * @function setJackpotModel
     * @param Jackpot Model
     * @return {Schema} JackpotModel
     */

    setModel = (Jackpot) => {
        return JackpotRepository.prototype.schema.model(Jackpot)
    }

    pushNewCurrency(_id, currency) {
        return new Promise( (resolve, reject) => {
            JackpotRepository.prototype.schema.model.update(
                {_id},
                { $push: {
                    limits              : {
                        currency            : currency,
                        tableLimit          : 0,
                        maxBet              : 0,
                        pot                 : 0
                    }
                }} 
            )
            .exec( async (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    updatePot(_id, currency, pot){
        return new Promise( (resolve,reject) => {
            JackpotRepository.prototype.schema.model.updateOne(
                {_id, "limits.currency": currency},
                {
                    $set: {
                        "limits.$.pot" : parseFloat(pot)
                    }
                }
            )
            .exec( async (err, item) => {
                if(err){reject(err)}
                resolve(item);
            })
        });
    }

    editEdgeJackpot(_id, edge) {
        return new Promise( (resolve, reject) => {
            JackpotRepository.prototype.schema.model.findByIdAndUpdate(
                {_id},
                {
                    $set: { edge }
                }
            )
            .lean()
            .exec( (err, item) => {
                if(err){reject(err)}
                resolve(item);
            });
        });
    }

    findJackpotById(_id){ 
        return new Promise( (resolve, reject) => {
            JackpotRepository.prototype.schema.model.findById(_id)
            .populate(
                [
                    {
                        path : 'resultSpace',
                        model : 'ResultSpace',
                        select : { '__v': 0}
                    }
                ]
            )
            .lean()
            .exec( (err, jackpot) => {
                if(err) { reject(err) }
                resolve(jackpot);
            });
        });
    }

    addBet(jackpot_id, bet){
        return new Promise( (resolve,reject) => {
            JackpotRepository.prototype.schema.model.findOneAndUpdate(
                { _id: jackpot_id, bets : {$nin : [bet._id] } },
                { $push: { "bets" : bet } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

    addWinResult(jackpot_id, result){
        return new Promise( (resolve,reject) => {
            JackpotRepository.prototype.schema.model.findOneAndUpdate(
                { _id: jackpot_id },
                { $push: { "winResult" : result } },
                (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

}

JackpotRepository.prototype.schema = new JackpotSchema();

export default JackpotRepository;