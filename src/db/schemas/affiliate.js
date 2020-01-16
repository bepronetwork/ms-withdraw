import {globals} from "../../Globals";
import mongoose from 'mongoose';

let db = globals.main_db;

class AffiliateSchema{};

AffiliateSchema.prototype.name = 'Affiliate';

AffiliateSchema.prototype.schema =  {
    wallet                              : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'}],
    affiliatedLinks                     : [{ type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateLink'}] , //  Mapping purpose, for its child
}


AffiliateSchema.prototype.model = db.model(AffiliateSchema.prototype.name, new db.Schema(AffiliateSchema.prototype.schema));
      
export {
    AffiliateSchema
}
