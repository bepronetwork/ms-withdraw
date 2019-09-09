import { globals } from "../../../Globals";
let db = globals.ecosystem_db;

class BlockchainSchema{};

BlockchainSchema.prototype.name = 'Blockchain';

BlockchainSchema.prototype.schema = {
    ticker              : { type: String, required : true},
    name                : { type: String, required : true}
};


// Mongoose o only allows once per type
BlockchainSchema.prototype.model = db.model(BlockchainSchema.prototype.name, new db.Schema(BlockchainSchema.prototype.schema));
        
export {
    BlockchainSchema
}
