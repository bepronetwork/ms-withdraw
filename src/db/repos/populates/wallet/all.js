
let populate_wallet_all = [
    {
        path : 'currency',
        model : 'Currency',
        select : { '__v': 0},
    },
    {
        path : 'depositAddresses',
        model : 'Address',
        select : { '__v': 0},
    },
] 

export default populate_wallet_all;