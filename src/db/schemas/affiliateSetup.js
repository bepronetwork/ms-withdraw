import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class AffiliateSetupSchema{};

AffiliateSetupSchema.prototype.name = 'AffiliateSetup';

AffiliateSetupSchema.prototype.schema =  {
    isActive             : {type : Boolean, required : true, default : true},
    affiliateStructures  : [{ type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateStructure'}],
}


AffiliateSetupSchema.prototype.model = db.model(AffiliateSetupSchema.prototype.name, new db.Schema(AffiliateSetupSchema.prototype.schema));
      
export {
    AffiliateSetupSchema
}
