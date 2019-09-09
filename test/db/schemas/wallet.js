import {globals} from "../../Globals";
let db = globals.main_db;

class WalletSchema{};

WalletSchema.prototype.name = 'Wallet';

WalletSchema.prototype.schema = {
    playBalance                 : { type: Number, required : true, default : 0}
}

WalletSchema.prototype.model = db.model(WalletSchema.prototype.name, new db.Schema(WalletSchema.prototype.schema));

export {
    WalletSchema
}
