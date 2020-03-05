import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class IntegrationsSchema{};

IntegrationsSchema.prototype.name = 'Integrations';

IntegrationsSchema.prototype.schema =  {
    chat        : { type : mongoose.Schema.Types.ObjectId, ref: 'Chat', required : true },
    mailSender  : { type : mongoose.Schema.Types.ObjectId, ref: 'MailSender', required : true },
}


IntegrationsSchema.prototype.model = db.model(IntegrationsSchema.prototype.name, new db.Schema(IntegrationsSchema.prototype.schema));
      
export {
    IntegrationsSchema
}
