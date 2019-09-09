import MongoComponent from './MongoComponent';
import { BetSchema } from '../schemas';
import { populate_bet } from './populates';
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


const foreignKeys = ['user', 'game', 'betResultSpace'];

class BetsRepository extends MongoComponent{

    constructor(){
        super(BetSchema)
    }
    /**
     * @function setBetModel
     * @param Bet Model
     * @return {Schema} BetModel
     */

    setModel = (bet) => {
        return BetsRepository.prototype.schema.model(bet)
    }

    resolveBet(_id, params){
        return new Promise( (resolve,reject) => {
            BetsRepository.prototype.schema.model.findByIdAndUpdate(
                { _id: _id, isResolved : { $eq : false } }, 
                { $set: 
                    { 
                        outcomeRaw          : params.outcomeRaw,
                        outcomeResultSpace  : params.outcomeResultSpace,
                        winAmount           : params.winAmount,
                        isWon               : params.isWon,
                        blockhash           : params.blockHash,
                        isResolved          : true
                }},{ new: true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }
    
    findBetById(_id){ 
        return new Promise( (resolve, reject) => {
            BetsRepository.prototype.schema.model.findById(_id)
            .populate(populate_bet)
            .exec( (err, Bet) => {
                if(err) { reject(err)}
                resolve(Bet);
            });
        });
    }


    getAll = async() => {
        return new Promise( (resolve,reject) => {
            BetsRepository.prototype.schema.model.find().lean().populate(foreignKeys)
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

BetsRepository.prototype.schema = new BetSchema();

export default BetsRepository;