import populate_wallet_all from "../wallet/all";

let populate_app_wallet = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
        populate : populate_wallet_all
    },
    {
        path : 'addOn',
        model : 'AddOn',
        select : { '__v': 0},
        populate : [
            {
                path : 'jackpot',
                model : 'Jackpot',
                select : { '__v': 0}
            },
            {
                path : 'pointSystem',
                model : 'PointSystem',
                select : { '__v': 0}
            }
        ]
    }
] 

export default populate_app_wallet;