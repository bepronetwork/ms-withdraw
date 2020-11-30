import populate_wallet_all from "../wallet/all";

let populate_app_address = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
        populate : [
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
            {  
                path : 'availableDepositAddresses.address',
                model : 'Address',
                select : { '__v': 0}
            }/*,
            {  
                path : 'availableDepositAddresses.lockedFor',
                model : 'User',
                select : { '__v': 0}
            }*/
        ]
    }
] 

export default populate_app_address;