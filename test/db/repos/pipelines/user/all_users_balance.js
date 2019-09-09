import mongoose from 'mongoose';


const pipeline_all_users_balance = (app_id) => 
    [
        //Stage 0
    {
        '$match' : {
            "app_id" : mongoose.Types.ObjectId(app_id)
        }
    },   
    {
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
        '$group': {
          '_id': 'all', 
          'balance': {
            '$sum': '$wallet.playBalance'
          }
        }
      }
]

export default pipeline_all_users_balance;

