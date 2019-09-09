import {globals} from "../../../Globals";
let db = globals.ecosystem_db;

class ResultSpaceSchema{};

ResultSpaceSchema.prototype.name = 'ResultSpace';

ResultSpaceSchema.prototype.schema = {
    formType                    : {type: String, required : true},  
    probability                 : {type: Number, required : true},
    metadataJSON                : {type : JSON, required : false}    
}


ResultSpaceSchema.prototype.model = db.model(ResultSpaceSchema.prototype.name, new db.Schema(ResultSpaceSchema.prototype.schema));
        
export {
    ResultSpaceSchema
}
