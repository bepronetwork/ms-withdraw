
let populate_app = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
    },
    {
        path : 'users',
        model : 'User',
        select : { '__v': 0}
    },
    {   
        path : 'games',
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
        path : 'withdraws',
        model : 'Withdraw',
        select : { '__v': 0}
    },
    {
        path : 'deposits',
        model : 'Deposit',
        select : { '__v': 0}
    }
] 

export default populate_app;