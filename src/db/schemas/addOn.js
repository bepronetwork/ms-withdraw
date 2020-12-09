import { globals } from "../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';
class AddOnSchema{};

AddOnSchema.prototype.name = 'AddOn';

AddOnSchema.prototype.schema =  {
    jackpot       : { type : mongoose.Schema.Types.ObjectId, ref: 'Jackpot' },
    autoWithdraw  : { type : mongoose.Schema.Types.ObjectId, ref: 'AutoWithdraw' },
    balance       : { type : mongoose.Schema.Types.ObjectId, ref: 'Balance' },
    txFee         : { type : mongoose.Schema.Types.ObjectId, ref: 'TxFee' },
    depositBonus  : { type : mongoose.Schema.Types.ObjectId, ref: 'DepositBonus' },
    pointSystem   : { type : mongoose.Schema.Types.ObjectId, ref: 'PointSystem' },
    freeCurrency  : { type : mongoose.Schema.Types.ObjectId, ref: 'FreeCurrency' },
}


AddOnSchema.prototype.model = db.model(AddOnSchema.prototype.name, new db.Schema(AddOnSchema.prototype.schema));
export {
    AddOnSchema
}
