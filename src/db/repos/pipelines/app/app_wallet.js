import mongoose from 'mongoose';


const pipeline_user_wallet = (_id, opt) => 
    [
        //Stage 0
    {
        '$match' : {
            "_id" : mongoose.Types.ObjectId(_id)
        }
    },  {
        '$lookup': {
            'from': 'wallets', 
            'localField': 'wallet', 
            'foreignField': '_id', 
            'as': 'wallet'
        }
    }, {
        '$project': {
            'wallet': {
                '$arrayElemAt': [
                    '$wallet', 0
                ]
            }
        }
    }, {
        '$project': {
            '_id' : false, 
            'playBalance': '$wallet.playBalance', 
            'eur': '$wallet.eur',
        }
    }
]

export default pipeline_user_wallet;



