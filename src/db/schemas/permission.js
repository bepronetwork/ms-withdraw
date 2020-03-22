import { globals } from "../../Globals";
import mongoose from 'mongoose';
let db = globals.main_db;


class PermissionSchema{};

PermissionSchema.prototype.name = 'Permission';

PermissionSchema.prototype.schema = {
    super_admin   : { type: Boolean, default: true },
    customization : { type: Boolean, default: true },
    withdraw      : { type: Boolean, default: true },
    user_withdraw  : { type: Boolean, default: true },
    financials    : { type: Boolean, default: true },
};

// Mongoose o only allows once per type
PermissionSchema.prototype.model = db.model('Permission', new db.Schema(PermissionSchema.prototype.schema));

export {
    PermissionSchema
}


