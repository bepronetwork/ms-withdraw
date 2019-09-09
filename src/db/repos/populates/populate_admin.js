
let populate_admin = [
    {
        path : 'security',
        model : 'Security',
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
                select : { '__v': 0}
            }
        ]
    }
] 

export default populate_admin;