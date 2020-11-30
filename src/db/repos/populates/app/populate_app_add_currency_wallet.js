import populate_wallet_all from "../wallet/all";

let populate_app_add_currency_wallet = [
    {
        path : 'currencies',
        model : 'Currency',
        select : { '__v': 0},
    },
    {
        path : 'addOn',
        model : 'AddOn',
        select : { '__v': 0},
        populate : [
           {
                path: 'autoWithdraw',
                model: 'AutoWithdraw',
                select : { '_id': 1}
            },{
                path : 'balance',
                model : 'Balance',
                select : { '_id': 1}
            },
            {
                path : 'jackpot',
                model : 'Jackpot',
                select : { '_id': 1}
            },{
                path : 'txFee',
                model : 'TxFee',
                select : { '_id': 1}
            },{
                path : 'depositBonus',
                model : 'DepositBonus',
                select : { '_id': 1}
            },
            {
                path : 'pointSystem',
                model : 'PointSystem',
                select : { '_id': 1}
            },
            {
                path : 'freeCurrency',
                model : 'FreeCurrency',
                select : { '__v': 0}
            }
        ]
    },
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
        populate : populate_wallet_all
    },
    {
        path : 'users',
        model : 'User',
        select : { 
            '_id': 1,
            'affiliate':1
        }
    },
    {   
        path : 'games',
        model : 'Game',
        select : { '_id': 1},
    }
] 

export default populate_app_add_currency_wallet;