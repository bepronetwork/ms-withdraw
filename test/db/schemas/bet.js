import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class BetSchema{};

BetSchema.prototype.name = 'Bet';

BetSchema.prototype.schema = {
    user                :   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true }, // Unilateral
    app                 :   { type: mongoose.Schema.Types.ObjectId, ref: 'App', required : true },  
    game                :   { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required : true },                     // Unilateral
    /* Bet Data */
    betAmount           : { type: Number, required: true},
    address             : { type : String, require : true},
    fee                 : { type: Number, required: true},
    result              : [{ type: mongoose.Schema.Types.ObjectId, ref: 'BetResultSpace', required : true }],
    /* Security Data */
    timestamp           : { type: Date, required : true},
    nonce               : { type: Number, required: true},
    clientSeed          : { type: String, required: true},
    serverHashedSeed    : { type: String, required: true},
    serverSeed          : { type: String, required: true},
    signature           : { type: JSON},
    /* Result Based Params */
    blockhash           : { type: String},
    outcomeRaw          : { type: String},
    winAmount           : { type: Number, required : true},
    outcomeResultSpace  : { type: JSON, required : true},
    isWon               : { type: Boolean, required : true},
    isResolved          : { type: Boolean , required : true, default : false}
}


BetSchema.prototype.model = db.model(BetSchema.prototype.name, new db.Schema(BetSchema.prototype.schema));
      
export {
    BetSchema
}
