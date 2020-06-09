import {globals} from "../../Globals";
import mongoose from "mongoose";
let db = globals.main_db;

class WalletSchema{};

WalletSchema.prototype.name = 'Wallet';

WalletSchema.prototype.schema = {
    playBalance                 : { type: Number, required : true, default : 0},
    currency                    : { type : mongoose.Schema.Types.ObjectId, ref: 'Currency', required : true },
    max_deposit                 : { type: Number, default: 1},
    max_withdraw                : { type: Number, default: 1},
    min_withdraw                : { type: Number, default: 0.000001},
    affiliate_min_withdraw      : { type: Number, default: 0.000001},
    bank_address                : { type: String},
    bitgo_id                    : { type: String},
    depositAddresses            : [{ type : mongoose.Schema.Types.ObjectId, ref: 'Address'}],
    hashed_passphrase           : { type: String},
    link_url                    : { type: String, default : null},
    availableDepositAddresses   : [{
        address             : { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
        lockedAt            : { type : Date },
        lockedFor           : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        history             : [{
            startTime   : { type: Date, required : true },
            endTime     : { type: Date, required : true },
            user        : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true }
        }]
    }],
    virtual                     : { type : Boolean, default : false, required : true},
    /* If Virtual Wallet */
    image                       : { type : String, default : ''},
    price                       : [{
        currency        : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount          : { type: Number}
    }],
    bonusAmount                  : { type : Number, default : 0, required : true},
    minBetAmountForBonusUnlocked : { type : Number, default : 0, required : true},
    incrementBetAmountForBonus   : { type : Number, default : 0, required : true}
}

WalletSchema.prototype.model = db.model(WalletSchema.prototype.name, new db.Schema(WalletSchema.prototype.schema));

export {
    WalletSchema
}
