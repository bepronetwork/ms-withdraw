import populate_wallet_all from "./wallet/all";

let populate_admin = [
    {
        path : 'security',
        model : 'Security',
        select : { '__v': 0},
    },
    {
        path : 'permission',
        model : 'Permission',
        select : { '__v': 0},
    },
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
    }
] 

export default populate_admin;