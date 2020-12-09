import { globals } from "../../../Globals";
let db = globals.main_db;
import mongoose from 'mongoose';

class PointSystemSchema{};

PointSystemSchema.prototype.name = 'PointSystem';

PointSystemSchema.prototype.schema =  {
    isValid : { type: Boolean, required : true, default : true },
    logo    : { type: String, required : true, default : "" },
    name    : { type: String, required : true, default : "" },
    ratio : [{
        currency : { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
        value    : { type: Number, required : true, default : 0 },
    }],
}


PointSystemSchema.prototype.model = db.model(PointSystemSchema.prototype.name, new db.Schema(PointSystemSchema.prototype.schema));
export {
    PointSystemSchema
}
