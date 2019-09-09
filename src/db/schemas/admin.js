import { globals } from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;


class AdminSchema{};

AdminSchema.prototype.name = 'Admin';

AdminSchema.prototype.schema = {
    username            : { type: String, required : true},
    name                : { type: String, required : true},
    email               : { type: String, required : true},
    hash_password       : { type: String, required : true},
    app                 : { type: mongoose.Schema.Types.ObjectId, ref: 'App'},
    security            : { type: mongoose.Schema.Types.ObjectId, ref: 'Security'},
    metadata            : { type : JSON}
};

AdminSchema.prototype.modelSet = false;

AdminSchema.prototype.model = null;

// Mongoose o only allows once per type
AdminSchema.prototype.model = db.model('Admin', new db.Schema(AdminSchema.prototype.schema));
      

export {
    AdminSchema
}


