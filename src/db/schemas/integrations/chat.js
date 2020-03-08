import {globals} from "../../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class ChatSchema{};

ChatSchema.prototype.name = 'Chat';

ChatSchema.prototype.schema =  {
    publicKey             : { type : String},
    privateKey            : { type : String},
    isActive              : { type : Boolean, default : false},
    name                  : { type : String, default : 'Live Chat'},
    metaName              : { type : String, default : 'live_chat'},
    link                  : { type : String, default : 'https://getstream.io'},
}


ChatSchema.prototype.model = db.model(ChatSchema.prototype.name, new db.Schema(ChatSchema.prototype.schema));
      
export {
    ChatSchema
}
