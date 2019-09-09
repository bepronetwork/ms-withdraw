import mongoose from 'mongoose';
import { byUserId } from "./filters";

const pipeline_transactions_app = (_id, filters) => 
    [
            //Stage 0
        {
            '$match' : {
                "app" : mongoose.Types.ObjectId(_id),
                'user': {
                    '$exists': true
                }
            }
        }, {
            '$lookup': {
                'from': 'users', 
                'localField': 'user', 
                'foreignField': '_id', 
                'as': 'user'
            }
        }, 
        // Add Filters
        
        ...setFilters(filters)

        ,{
            '$project': {
                'user': {
                    '$arrayElemAt': [
                        '$user', 0
                    ]
                }, 
                'address': true, 
                'creation_timestamp': true, 
                'last_update_timestamp': true, 
                'currency': true, 
                'invoice': true, 
                'amount' : true,
                'usd_amount' : true,
                'confirmed': true, 
                'app' : true,
                'maxConfirmations': true, 
                'confirmations': true
            }
        }, {
            '$group': {
                '_id': '$app', 
                'deposits': {
                    '$push': '$$ROOT'
                }, 
                'totalDeposited': {
                    '$sum': '$usd_amount'
                }, 
                'amount': {
                    '$sum': 1
                }
            }
        }
].filter( el => el != null);

export default pipeline_transactions_app;


function setFilters(filters){
    return filters.map( (filter) => {
        return filtersFunctions[filter.function](...filter.args);
    }).filter( el => el != null);
}

const filtersFunctions = {
    'byUserId' : byUserId
}