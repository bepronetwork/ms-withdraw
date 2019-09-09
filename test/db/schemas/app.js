import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class AppSchema{};

AppSchema.prototype.name = 'App';

AppSchema.prototype.schema =  {
    name                : {  type: String, required : true},
    description         : {  type: String, required : true},
    isValid             : {  type: Boolean, required : true, default : false},
    ownerAddress        : { type: String, required : true, default : 'N/A'},
    authorizedAddress   : { type: String, required : true, default : 'N/A'},
    games               : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
    listAdmins          : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required : true}],
    services            : [{type: Number}],
    currencyTicker      : {type : String},
    users               : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    external_users      : [{type: String}],
    decimals            : {type : Number},
    wallet              : {  type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    deposits            : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deposit'}],
    withdraws           : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Withdraw'}],
    countriesAvailable  : [{ type: Number}],
    bearerToken         : { type: String },
    platformAddress     : { type : String },
    platformBlockchain  : { type : String },
    platformTokenAddress: { type : String },
    licensesId          : [{ type: String}],
    metadataJSON        : {  type: JSON},
    isWithdrawing       : { type : Boolean, default : false, required : true }
}


AppSchema.prototype.model = db.model(AppSchema.prototype.name, new db.Schema(AppSchema.prototype.schema));
      
export {
    AppSchema
}
