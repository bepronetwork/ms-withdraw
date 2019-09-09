import { globals } from "../../../Globals";
let db = globals.ecosystem_db;

class TokenSchema{};

TokenSchema.prototype.name = 'Token';

TokenSchema.prototype.schema = {
    ticker              : { type: String, required : true},
    name                : { type: String, required : true},
    address             : { type: String, required : true},
    decimals            : { type: Number, required : true}
}

// Mongoose o only allows once per type
TokenSchema.prototype.model = db.model(TokenSchema.prototype.name, new db.Schema(TokenSchema.prototype.schema));


export {
    TokenSchema
}
