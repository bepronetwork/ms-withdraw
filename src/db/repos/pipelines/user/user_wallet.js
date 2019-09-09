import mongoose from 'mongoose';


const pipeline_app_wallet = (_id) => 
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
            '_id': false, 
            'playBalance': '$wallet.playBalance', 
            'eur': '$wallet.eur', 
            'eth': '$wallet.eth'
        }
    }
]

export default pipeline_app_wallet;



