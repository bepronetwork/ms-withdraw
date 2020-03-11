import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class UserSchema{};

UserSchema.prototype.name = 'User';

UserSchema.prototype.schema = {
    username            : { type: String, required : true},
    name                : { type: String, required : true},
    full_name           : { type: String},
    nationality         : { type: String},
    age                 : { type: Number},
    email               : { type: String, required : true},
    hash_password       : { type: String},
    external_user       : { type: Boolean, required : true},
    external_id         : { type: String},
    bearerToken         : { type: String },
    app_id              : { type: mongoose.Schema.Types.ObjectId, ref: 'App', required : true},
    bets                : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet'}],
    deposits            : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deposit'}],
    withdraws           : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Withdraw'}],
    wallet              : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'}],
    affiliate           : { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required : true}, // User Affiliate -> is profit based affiliates
    affiliateLink       : { type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateLink'}, // UserAffiliated that is parent based
    register_timestamp  : { type: Date, required : true},
    metadata            : { type : JSON },
    isWithdrawing       : { type : Boolean, default : false, required : true },
    security            : { type: mongoose.Schema.Types.ObjectId, ref: 'Security', required : true},
    email_confirmed     : { type : Boolean, default : false, required : true }
}


// db o only allows once per type
UserSchema.prototype.model = db.model(UserSchema.prototype.name, new db.Schema(UserSchema.prototype.schema));
    
export {
    UserSchema
}
