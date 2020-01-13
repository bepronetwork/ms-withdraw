import populate_wallet_all from "./wallet/all";

let populate_bet = [
    {
        path : 'app',
        model : 'App',
        select : { '__v': 0},
        populate : [
            {
                path : 'wallet',
                model : 'Wallet',
                select : { '__v': 0},
                populate : populate_wallet_all
            }
        ]
    },
    {
        path : 'user',
        model : 'User',
        select : { '__v': 0},
        populate : [
            {
                path : 'wallet',
                model : 'Wallet',
                select : { '__v': 0},
                populate : populate_wallet_all
            }
        ]
    },
    {   
        path : 'game',
        model : 'Game',
        select : { '__v': 0},
        populate : [
            {
                path : 'resultSpace',
                model : 'ResultSpace',
                select : { '__v': 0}
            }
        ]
    },
    {   
        path : 'result',
        model : 'BetResultSpace',
        select : { '__v': 0}
    }
] 

export default populate_bet;