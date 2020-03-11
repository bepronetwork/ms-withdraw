import MongoComponent from './MongoComponent';
import { ChatSchema } from '../schemas';

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


class ChatRepository extends MongoComponent{

    constructor(){
        super(ChatSchema)
    }
    /**
     * @function setChatModel
     * @param Chat Model
     * @return {Schema} ChatModel
     */

    setModel = (Chat) => {
        return ChatRepository.prototype.schema.model(Chat)
    }

    findById(_id){ 
        return new Promise( (resolve, reject) => {
            ChatRepository.prototype.schema.model.findById(_id)
            .exec( (err, item) => {
                if(err) { reject(err)}
                resolve(item);
            });
        });
    }

    findByIdAndUpdate(_id, newStructure){
        return new Promise( (resolve,reject) => {
            ChatRepository.prototype.schema.model.findByIdAndUpdate(
                _id, 
                { $set: { 
                    "publicKey" : newStructure.publicKey,
                    "privateKey" : newStructure.privateKey,
                    "isActive"   : newStructure.isActive
                } },
                { 'new': true })
                .exec( (err, item) => {
                    if(err){reject(err)}
                    resolve(item);
                }
            )
        });
    }

}

ChatRepository.prototype.schema = new ChatSchema();

export default ChatRepository;