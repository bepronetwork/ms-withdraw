import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class FreeCurrencySchema{};

FreeCurrencySchema.prototype.name = 'FreeCurrency';

FreeCurrencySchema.prototype.schema =  {
    wallets : [{
        activated : { type: Boolean, default : false},
        currency  : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency'},
        time      : { type: Number, default : 3600000},
        value     : { type: Number, default : 0},
        multiplier: { type: Number, default : 10},
    }]
}

FreeCurrencySchema.prototype.model = db.model(FreeCurrencySchema.prototype.name, new db.Schema(FreeCurrencySchema.prototype.schema));
export {
    FreeCurrencySchema
}
