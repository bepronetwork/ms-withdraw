import mongoose from 'mongoose';
import { pipeline_bets_by_date } from '../filters';

const pipeline_user_stats = (_id, { dates }) => 
	[
		{
			'$match': {
			'_id': mongoose.Types.ObjectId(_id)
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
			'games.name': true
			}
		}, {
			'$unwind': {
			'path': '$games'
			}
		}, {
			'$project': {
			'bets': '$games.bets', 
			'name': '$games.name'
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
			'game': {
				'name': '$name'
			}
			}
        }, 
            ...pipeline_bets_by_date({from_date : dates.from, to_date : dates.to}) 
        ,{
			'$lookup': {
			'from': 'users', 
			'localField': 'bet.user', 
			'foreignField': '_id', 
			'as': 'user'
			}
		}, {
			'$project': {
			'user': {
				'$arrayElemAt': [
				'$user', 0
				]
			}, 
			'betAmount': '$bet.betAmount', 
			'winAmount': '$bet.winAmount'
			}
		}, {
			'$group': {
			'_id': {
				'user': '$user._id', 
				'name': '$user.name', 
				'email': '$user.email', 
				'wallet': '$user.wallet'
			}, 
			'bets': {
				'$sum': 1
			}, 
			'betAmount': {
				'$sum': '$betAmount'
			}, 
			'winAmount': {
				'$sum': '$winAmount'
			}
			}
		}, {
			'$lookup': {
			'from': 'wallets', 
			'localField': '_id.wallet', 
			'foreignField': '_id', 
			'as': 'wallet'
			}
		}, {
			'$project': {
			'_id': '$_id.user', 
			'name': '$_id.name', 
			'email': '$_id.email', 
			'bets': '$bets', 
			'betAmount': '$betAmount', 
			'winAmount': '$winAmount', 
			'profit': {
				'$subtract': [
				'$winAmount', '$betAmount'
				]
			}, 
			'playBalance': {
				'$arrayElemAt': [
				'$wallet.playBalance', 0
				]
			}
		}
	}
]





export default pipeline_user_stats;

