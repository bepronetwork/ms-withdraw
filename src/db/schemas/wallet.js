import {globals} from "../../Globals";
import mongoose from "mongoose";
let db = globals.main_db;

class WalletSchema{};

WalletSchema.prototype.name = 'Wallet';

WalletSchema.prototype.schema = {
    playBalance                 : { type: Number, required : true, default : 0},
    currency                    : { type : mongoose.Schema.Types.ObjectId, ref: 'Currency', required : true },
    bank_address                : { type: String, default : 0}, //Only Need on App
    max_deposit                 : { type: Number, default: 0},
    max_withdraw                : { type: Number, default: 0}
}

WalletSchema.prototype.model = db.model(WalletSchema.prototype.name, new db.Schema(WalletSchema.prototype.schema));

export {
    WalletSchema
}
