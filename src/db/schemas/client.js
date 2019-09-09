import {globals} from "../../Globals";
let mongoose = globals.main_db;
var schema = new mongoose.Schema({
    name                : { type: String, required : true},
    email               : { type: String, required : true},
    username            : { type: String, required : true},
    hash_password       : { type: String, required : true },
    photo               : { type: String}
});

let model = {
    Main        : globals.main_db.model('Client', schema),
}

export default model;