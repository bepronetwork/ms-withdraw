
let populate_user = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
    },
    {
        path : 'app_id',
        model : 'App',
        select : { '__v': 0},
        populate : [
            {
                path : 'wallet',
                model : 'Wallet',
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

export default populate_user;