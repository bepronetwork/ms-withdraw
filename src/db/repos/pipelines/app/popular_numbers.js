import mongoose from 'mongoose';


const pipeline_popular_numbers = (_id) => 
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
      }, {
        '$group': {
          '_id': {
            'game': '$bet.game', 
            'key': '$bet.outcomeResultSpace.key', 
            'index': '$bet.outcomeResultSpace.index', 
            'probability': '$bet.outcomeResultSpace.probability'
          }, 
          'resultAmount': {
            '$sum': 1
          }
        }
      }, {
        '$group': {
          '_id': {
            'game': '$_id.game'
          }, 
          'items': {
            '$push': {
              'key': '$_id.key', 
              'index': '$_id.index', 
              'probability': '$_id.probability', 
              'resultAmount': '$resultAmount'
            }
          }
        }
    },
    {
        '$project': {
          '_id': false, 
          'game': '$_id.game', 
          'numbers': '$items'
        }
      }, {
        '$sort': {
          'numbers.resultAmount': 1
        }
      }
]


export default pipeline_popular_numbers;
