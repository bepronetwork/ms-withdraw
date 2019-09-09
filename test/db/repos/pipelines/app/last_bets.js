import mongoose from 'mongoose';


const pipeline_last_bets = (_id) => 
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
        '$lookup': {
        'from': 'users', 
        'localField': 'bet.user', 
        'foreignField': '_id', 
        'as': 'bet.user'
        }
    }, {
        '$lookup': {
        'from': 'games', 
        'localField': 'bet.game', 
        'foreignField': '_id', 
        'as': 'bet.game'
        }
    }, {
        '$project': {
        'bet': true, 
        'user': {
            '$arrayElemAt': [
            '$bet.user', 0
            ]
        }, 
        'game': {
            '$arrayElemAt': [
            '$bet.game', 0
            ]
        }
        }
    },
    {
        '$sort': {
            'bet.timestamp': -1
        }
    },
    {
        '$limit': 100
    },
    {
        '$project': {
            '_id': '$bet._id', 
            'betAmount': '$bet.betAmount', 
            'timestamp': '$bet.timestamp', 
            'isWon': '$bet.isWon', 
            'winAmount': '$bet.winAmount', 
            'username': '$user.username', 
            'game': '$game.name'
        }
    }
]


export default pipeline_last_bets;