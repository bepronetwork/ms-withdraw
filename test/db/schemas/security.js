import { globals } from "../../Globals";
let db = globals.main_db;

class SecuritySchema{};

SecuritySchema.prototype.name = 'Security';

SecuritySchema.prototype.schema = {
    '2fa_set'           : { type: Boolean, required : false},
    '2fa_secret'        : { type: String, required : false},
    'email_verified'    : { type: Boolean, required : false},
    'bearerToken'       : { type : String, required : false}
};



SecuritySchema.prototype.model = db.model('Security', new db.Schema(SecuritySchema.prototype.schema));
      

export {
    SecuritySchema
}


