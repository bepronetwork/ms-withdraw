import MongoComponent from '../MongoComponent';
import { GameSchema } from '../../schemas/ecosystem/game';


const foreignKeys = ['resultSpace'];

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


class GamesEcoRepository extends MongoComponent{

    constructor(){
        super(GameSchema)
    }
    /**
     * @function setGameModel
     * @param Game Model
     * @return {Schema} GameModel
     */

    setModel = (Game) => {
        return this.schema.model(Game)
    }
    
    findGameById(_id){ 
        return new Promise( (resolve, reject) => {
            this.schema.model.findById(_id)
            .populate(foreignKeys)
            .exec( (err, Game) => {
                if(err) { resolve(null)}
                resolve(Game);
            });
        });
    }

    async getAll(){
        return new Promise( (resolve,reject) => {
            this.schema.model.find().lean().populate(foreignKeys)
            .exec( (err, docs) => {
                if(err){reject(err)}
                resolve(docs);
            })
        })
    }
}

GamesEcoRepository.prototype.schema = new GameSchema();

export default GamesEcoRepository;