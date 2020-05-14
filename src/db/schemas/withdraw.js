import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class WithdrawSchema{};

WithdrawSchema.prototype.name = 'Withdraw';

WithdrawSchema.prototype.schema =  {
    user                    : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},     // App Integrated Id for User
    app                     : { type: mongoose.Schema.Types.ObjectId, ref: 'App'},      // App Integrated Id for Company
    creation_timestamp      : { type: Date, required : true},                           // Timestamp
    last_update_timestamp   : { type: Date},                           // Last Update Timestamp
    address                 : { type: String},                         // Deposit Address 
    currency                : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required : true},      // App Integrated Id for Company
    transactionHash         : { type: String},
    logId                   : { type: String},
    amount                  : { type: Number},
    withdraw_external_id    : { type: String},                                          // App Integrated Id Unique for Withdraw
    usd_amount              : { type: Number},
    nonce                   : { type : Number, required : true},
    callback_URL            : { type: String},
    bitgo_id                : { type: String},
    confirmations           : { type: Number, required : true, default : 0},
    maxConfirmations        : { type: Number, required : true, default : 0},
    confirmed               : { type: Boolean, default : false},
    done                    : { type: Boolean, default : false},
    status                  : { type: String, required : true, default : 'Queue'},
    isAffiliate             : { type: Boolean, default : false},
    link_url                : { type: String, default : null},
    withdrawNotification    : { type: String, default : ''},
    note                    : { type: String, default : ''},
    fee                     : { type: Number }
}


WithdrawSchema.prototype.model = db.model(WithdrawSchema.prototype.name, new db.Schema(WithdrawSchema.prototype.schema));
      
export {
    WithdrawSchema
}