import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class DepositSchema{};

DepositSchema.prototype.name = 'Deposit';

DepositSchema.prototype.schema = {
    user                    : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},     // App Integrated Id for User
    app                     : { type: mongoose.Schema.Types.ObjectId, ref: 'App'},      // App Integrated Id for Company
    creation_timestamp      : { type: Date, required : true},                           // Timestamp
    last_update_timestamp   : { type: Date, required : true},                           // Last Update Timestamp
    address                 : { type: String, required : true},                         // Deposit Address 
    currency                : { type: String, required : true},
    transactionHash         : { type: String, required : true},
    amount                  : { type: Number, required : true},
    deposit_external_id     : { type: String},                                          // App Integrated Id Unique for Deposit
    usd_amount              : { type: Number},
    callback_URL            : { type: String},
    confirmations           : { type: Number, required : true, default : 0},
    maxConfirmations        : { type: Number, required : true, default : 0},
    confirmed               : { type: Boolean, default : false}
}

// db o only allows once per type
DepositSchema.prototype.model = db.model(DepositSchema.prototype.name, new db.Schema(DepositSchema.prototype.schema));
      
export {
    DepositSchema
}
