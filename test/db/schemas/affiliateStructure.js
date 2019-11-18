import {globals} from "../../Globals";
let db = globals.main_db;

class AffiliateStructureSchema{};

AffiliateStructureSchema.prototype.name = 'AffiliateStructure';

AffiliateStructureSchema.prototype.schema =  {
    percentageOnLoss                    : {type : Number, required : true},
    level                               : {type : Number, required : true},
    isActive                            : {type : Boolean, required : true, default : true},
}


AffiliateStructureSchema.prototype.model = db.model(AffiliateStructureSchema.prototype.name, new db.Schema(AffiliateStructureSchema.prototype.schema));
      
export {
    AffiliateStructureSchema
}
