import populate_wallet_all from "../wallet/all";

let populate_user_wallet = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
        populate : populate_wallet_all
    }
] 

export default populate_user_wallet;