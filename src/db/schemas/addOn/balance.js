import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class BalanceSchema{};

BalanceSchema.prototype.name = 'Balance';

BalanceSchema.prototype.schema =  {
    initialBalanceList : [{
        currency       : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        initialBalance : { type: Number, required : true, default : 0},
        multiplier     : { type: Number, default : 10},
    }]
}

BalanceSchema.prototype.model = db.model(BalanceSchema.prototype.name, new db.Schema(BalanceSchema.prototype.schema));
export {
    BalanceSchema
}
