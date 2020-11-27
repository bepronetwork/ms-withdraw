import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class AutoWithdrawSchema{};

AutoWithdrawSchema.prototype.name = 'AutoWithdraw';

AutoWithdrawSchema.prototype.schema =  {
    isAutoWithdraw        : { type: Boolean, default: false },
    maxWithdrawAmountCumulative  : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    maxWithdrawAmountPerTransaction  : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    verifiedKYC           : { type: Boolean, required : true, default : false},
}


AutoWithdrawSchema.prototype.model = db.model(AutoWithdrawSchema.prototype.name, new db.Schema(AutoWithdrawSchema.prototype.schema));
export {
    AutoWithdrawSchema
}
