import {globals} from "../../../Globals";
let db = globals.main_db;

class KycSchema{};

KycSchema.prototype.name = 'Kyc';

KycSchema.prototype.schema =  {
    clientId      : { type : String},
    flowId        : { type : String},
    client_secret : { type : String},
    isActive      : { type : Boolean},
    link          : { type : String, default : 'https://getmati.com'},
    name          : { type : String, default : 'Kyc'},
    metaName      : { type : String, default : 'kyc'},
}


KycSchema.prototype.model = db.model(KycSchema.prototype.name, new db.Schema(KycSchema.prototype.schema));
export {
    KycSchema
}
