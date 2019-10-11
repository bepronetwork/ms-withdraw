import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class AffiliateLinkSchema{};

AffiliateLinkSchema.prototype.name = 'AffiliateLink';

AffiliateLinkSchema.prototype.schema = {
    userAffiliated                      : { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // actual User
    affiliate                           : { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate'}, // Just for mapping
    parentAffiliatedLinks               : [{ type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateLink'}] , // Parent Affiliated that will resemble return from this one
    affiliateStructure                  : { type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateStructure'},
}


AffiliateLinkSchema.prototype.model = db.model(AffiliateLinkSchema.prototype.name, new db.Schema(AffiliateLinkSchema.prototype.schema));
      
export {
    AffiliateLinkSchema
}
