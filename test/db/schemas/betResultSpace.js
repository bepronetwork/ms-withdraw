import {globals} from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;

class BetResultSpaceSchema{};

BetResultSpaceSchema.prototype.name = 'BetResultSpace';

BetResultSpaceSchema.prototype.schema = {
    place                       : {type: String, required : true},  
    value                       : {type: Number, required : true}
};

// db o only allows once per type
BetResultSpaceSchema.prototype.model = db.model(BetResultSpaceSchema.prototype.name, new db.Schema(BetResultSpaceSchema.prototype.schema));
      
export {
    BetResultSpaceSchema
}
