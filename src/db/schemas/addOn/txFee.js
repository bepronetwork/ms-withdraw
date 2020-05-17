import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class TxFeeSchema{};

TxFeeSchema.prototype.name = 'TxFee';

TxFeeSchema.prototype.schema =  {
    isTxFee        : { type: Boolean, default: false },
    deposit_fee    : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    withdraw_fee   : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
}


TxFeeSchema.prototype.model = db.model(TxFeeSchema.prototype.name, new db.Schema(TxFeeSchema.prototype.schema));
export {
    TxFeeSchema
}
