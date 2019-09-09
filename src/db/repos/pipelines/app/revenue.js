import mongoose from 'mongoose';
import { pipeline_bets_by_date } from '../filters';


const pipeline_revenue_stats = (_id, { dates }) => 
    [
        //Stage 0
    {
        '$match' : {
            "_id" : mongoose.Types.ObjectId(_id)
        }
    },  {
        '$lookup': {
          'from': 'games', 
          'localField': 'games', 
          'foreignField': '_id', 
          'as': 'games'
        }
      }, {
        '$project': {
          'games.bets': true, 
          'games.edge': true, 
          '_id': false
        }
      }, {
        '$unwind': {
          'path': '$games'
        }
      }, {
        '$project': {
          'bets': '$games.bets', 
          'edge': '$games.edge'
        }
      }, {
        '$unwind': {
          'path': '$bets'
        }
      }, {
        '$lookup': {
          'from': 'bets', 
          'localField': 'bets', 
          'foreignField': '_id', 
          'as': 'bet'
        }
      }, {
        '$project': {
          'bet': {
            '$arrayElemAt': [
              '$bet', 0
            ]
          }, 
          'fee': {
            '$arrayElemAt': [
              '$bet.fee', 0
            ]
          }
        }
      }, 
        ...pipeline_bets_by_date({from_date : dates.from, to_date : dates.to}) 
    ,{
        '$group': {
          '_id': {
            'hour': {
              '$hour': '$bet.timestamp'
            }, 
            'day': {
              '$dayOfYear': '$bet.timestamp'
            }, 
            'year': {
              '$year': '$bet.timestamp'
            }
          }, 
          'lossAmount': {
            '$sum': '$bet.winAmount'
          }, 
          'revenueAmount': {
            '$sum': '$bet.betAmount'
          }, 
          'betsAmount': {
            '$sum': 1
          }, 
          'fees': {
            '$sum': '$bet.fee'
          }
        }
      }, {
        '$addFields': {
          'profitAmount': {
            '$subtract': [
              '$revenueAmount', '$lossAmount'
            ]
          }
        }
      }, {
        '$project': {
          '_id': false, 
          'date': {
            'hour': '$_id.hour', 
            'day': '$_id.day', 
            'year': '$_id.year'
          }, 
          'financials': {
            'loss': '$lossAmount', 
            'bets': '$betsAmount', 
            'revenue': '$revenueAmount', 
            'totalProfit': '$profitAmount', 
            'feeProfit': '$fees', 
            'gambleProfit': {
              '$subtract': [
                '$profitAmount', '$fees'
              ]
            }
          }
        }
      }
]

export default pipeline_revenue_stats;



