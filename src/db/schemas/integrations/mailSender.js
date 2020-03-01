import {globals} from "../../../Globals";
import mongoose from 'mongoose';
import { SendInBlueFunctions } from "../../../logic/third-parties";
let db = globals.main_db;

class MailSenderSchema{};

MailSenderSchema.prototype.name = 'MailSender';

MailSenderSchema.prototype.schema =  {
    apiKey        : { type : String, default : null },
    templateIds   : { type : Array, default : SendInBlueFunctions }
}


MailSenderSchema.prototype.model = db.model(MailSenderSchema.prototype.name, new db.Schema(MailSenderSchema.prototype.schema));
      
export {
    MailSenderSchema
}
