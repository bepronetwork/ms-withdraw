import mongoose from "mongoose";

export function userWithdrawsFiltered({size, offset, app, user, status}){
    var limit, skip, user, status_match;

    if(offset != 0){
        size += offset;
        skip = {
            '$skip': offset
        };
    }

    if(size != 0){
        limit = {
            '$limit': size
        };
    };

    if(status){
        status_match = {
            '$match': {
                'status' : status
            }
        };
    }

    if(user){
        user = {
            '$match': {
                user : mongoose.Types.ObjectId(user)
            }
        };
    }

    let sort = {
        '$sort': {
            'creation_timestamp': -1
        }
    }
    
    let populate = [
        {
            '$match': {
                app : mongoose.Types.ObjectId(app)
            }
        },
        {
            '$match': {
                'user' : { '$ne' : null }
            }
        },

    ]

    populate.push(user);
    populate.push(status_match);
    populate.push(sort);
    populate.push(skip);
    populate.push(limit);
    populate = populate.filter(el => el != undefined);
    return populate;
}

