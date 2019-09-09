import mongoose from 'mongoose';
import { pipeline_bets_by_date } from '../filters';


const pipeline_bet_stats = (_id, { dates }) => 
    [
        //Stage 0
    {
        '$match' : {
            "_id" : mongoose.Types.ObjectId(_id)
        }
    },
    {
      '$lookup': {
        'from': 'games', 
        'localField': 'games', 
        'foreignField': '_id', 
        'as': 'games'
      }
    }, {
      '$project': {
        'games.bets': true, 
        '_id': false
      }
    }, {
      '$unwind': {
        'path': '$games'
      }
    }, {
        '$project': {
            'bets': '$games.bets'
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
        }
      }
    }, 
        ...pipeline_bets_by_date({from_date : dates.from, to_date : dates.to})    
    ,{
      '$group': {
        '_id': {
          'week': {
            '$week': '$bet.timestamp'
          }, 
          'year': {
            '$year': '$bet.timestamp'
          }
        }, 
        'averageBet': {
          '$avg': '$bet.betAmount'
        }, 
        'averageBetReturn': {
          '$avg': {
            '$subtract': [
              '$bet.betAmount', '$bet.winAmount'
            ]
          }
        }, 
        'betsWon': {
          '$sum': {
            '$cond': {
              'if': {
                '$eq': [
                  '$bet.isWon', true
                ]
              }, 
              'then': 1, 
              'else': 0
            }
          }
        }, 
        'betsAmount': {
          '$sum': 1
        }
      }
    }, {
        '$project': {
            '_id': false, 
            'date': {
            'week': '$_id.week', 
            'year': '$_id.year'
            }, 
            'bets': {
            'avg_bet': '$averageBet', 
            'avg_bet_return': '$averageBetReturn', 
            'won': '$betsWon', 
            'percentage_won': {
                '$divide': [
                '$betsWon', '$betsAmount'
                ]
            }, 
            'amount': '$betsAmount'
            }
        }
    }
]


export default pipeline_bet_stats;