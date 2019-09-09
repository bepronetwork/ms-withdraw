import {globals} from "../../../Globals";
import mongoose from 'mongoose';
let db = globals.ecosystem_db;

class GameSchema{};

GameSchema.prototype.name = 'Game';

GameSchema.prototype.schema = {
    name                : { type: String, required : true}, 
    metaName            : { type: String, required : true}, 
    description         : { type: String, required : true},     
    resultSpace         : [{type: mongoose.Schema.Types.ObjectId, ref: 'ResultSpace', required : true }],
    image_url           : { type: String, required: true },
    description         : { type: String, required: true },
    metadataJSON        : { type: JSON},
    isValid             : { type: Boolean , required : true, default : true},
}

GameSchema.prototype.model = db.model(GameSchema.prototype.name, new db.Schema(GameSchema.prototype.schema));
     
export {
    GameSchema
}
