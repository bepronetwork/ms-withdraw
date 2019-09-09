import mongoose from 'mongoose';


const pipeline_my_bets = (_id) => 
    [
        //Stage 0
    {
        '$match' : {
            "_id" : mongoose.Types.ObjectId(_id)
        }
    },
    {
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
    }
    ,{
        '$lookup': {
        'from': 'games', 
        'localField': 'bet.game', 
        'foreignField': '_id', 
        'as': 'bet.game'
        }
    }, {
        '$project': {
        'bet': true, 
        'game': {
            '$arrayElemAt': [
            '$bet.game', 0
            ]
        }
        }
    }, 
    {
        '$limit': 100
    },
    {
        '$sort': {
            'bet.timestamp': -1
        }
    },
    {
        '$project': {
            '_id': '$bet._id', 
            'betAmount': '$bet.betAmount', 
            'timestamp': '$bet.timestamp', 
            'isWon': '$bet.isWon', 
            'winAmount': '$bet.winAmount', 
            'game': '$game.name'
        }
    },
   
]


export default pipeline_my_bets;