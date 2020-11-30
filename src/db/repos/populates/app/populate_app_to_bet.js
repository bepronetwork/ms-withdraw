import populate_integrations_all from "../integrations/all";
import populate_customization_all from "../customization/all";
import populate_typography from "../typography/index";
import populate_wallet_all from "../wallet/all";

let populate_app_to_bet = [
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
                select : { '__v': 0, 'bets':0, 'winResult':0, 'resultSpace':0}
            },
            {
                path : 'pointSystem',
                model : 'PointSystem',
                select : { '__v': 0}
            }
        ]
    }
]

export default populate_app_to_bet;