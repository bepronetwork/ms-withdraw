import { globals } from "../../../Globals";
let db = globals.ecosystem_db;

class AuthorizedSchema{};

AuthorizedSchema.prototype.name = 'Authorized';

AuthorizedSchema.prototype.schema =   {
    address : { type: String, required : true}
}

AuthorizedSchema.prototype.modelSet = false;


AuthorizedSchema.prototype.model = db.model(AuthorizedSchema.prototype.name, new db.Schema(AuthorizedSchema.prototype.schema));
  
export {
    AuthorizedSchema
}
