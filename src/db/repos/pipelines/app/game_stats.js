import mongoose from 'mongoose';
import { pipeline_bets_by_date } from '../filters';


const pipeline_game_stats = (_id, { dates}) => 
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
            'games.bets' : true, 
            'games.name' : true, 
            'games.edge' : true, 
            'games.description' : true,
            'games._id': true
        }
    }, {
        '$unwind': {
            'path': '$games'
        }
    }, {
        '$project': {
            'bets': '$games.bets', 
            'name': '$games.name', 
            'edge': '$games.edge', 
            'game_id': '$games._id'
        }
    }, {
        '$unwind': {
            'path': '$bets',
            'preserveNullAndEmptyArrays' : true
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
            'game': {
            'name': '$name', 
            'edge': '$edge', 
            '_id': '$game_id'
            }
        }
    }, 
        ...pipeline_bets_by_date({from_date : dates.from, to_date : dates.to}) 
    ,{
        '$group': {
            '_id': {
                '_id': '$game._id', 
                'month': {
                    '$month': '$bet.timestamp'
                }, 
                'year': {
                    '$year': '$bet.timestamp'
                }, 
            'game': '$bet.game', 
            'name': '$game.name'
            }, 
            'betAmount': {
            '$sum': '$bet.betAmount'
            }, 
            'betsAmount': {
            '$sum': 1
            }, 
            'paidAmount': {
            '$sum': '$bet.winAmount'
            }, 
            'fees': {
            '$sum': '$bet.fee'
            }, 
            'edge': {
            '$first': '$game.edge'
            }
        }
    }, {
        '$group': {
            '_id': {
            'month': '$_id.month', 
            'year': '$_id.year'
            }, 
            'games': {
            '$push': {
                '_id': '$_id._id', 
                'name': '$_id.name', 
                'edge': '$_id.edge', 
                'betsAmount': '$betAmount', 
                'betAmount': '$betsAmount', 
                'profit': {
                '$subtract': [
                    '$betAmount', '$paidAmount'
                ]
                }, 
                'fees': '$fees', 
                'edge': '$edge'
            }
            }
        }
    }, {
        '$project': {
            '_id': false, 
            'date': {
            'month': '$_id.month', 
            'year': '$_id.year'
            }, 
            'games': '$games'
        }
    }
]

export default pipeline_game_stats;

