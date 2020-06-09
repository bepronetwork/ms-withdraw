import { globals } from "../../Globals";
let db = globals.main_db;

class CurrencySchema{};

CurrencySchema.prototype.name = 'Currency';

CurrencySchema.prototype.schema = {
    ticker              : { type: String, required : true},
    name                : { type: String, required : true},
    address             : { type: String},
    decimals            : { type: Number, required : true},
    image               : { type: String},
    /* For virtual currencies */
    virtual             : { type: Boolean, default : false}
}

// Mongoose only allows once per type
CurrencySchema.prototype.model = db.model(CurrencySchema.prototype.name, new db.Schema(CurrencySchema.prototype.schema));


export {
    CurrencySchema
}
