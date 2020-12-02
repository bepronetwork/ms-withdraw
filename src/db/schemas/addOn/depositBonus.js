import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class DepositBonusSchema{};

DepositBonusSchema.prototype.name = 'DepositBonus';

DepositBonusSchema.prototype.schema =  {
    isDepositBonus       : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        value                : { type: Boolean, required : true, default : false},
    }],
    min_deposit          : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    percentage           : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    max_deposit          : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        amount               : { type: Number, required : true, default : 0},
    }],
    multiplier           : [{
        currency             : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        multiple             : { type: Number, required : true, default : 10},
    }],
}


DepositBonusSchema.prototype.model = db.model(DepositBonusSchema.prototype.name, new db.Schema(DepositBonusSchema.prototype.schema));
export {
    DepositBonusSchema
}
