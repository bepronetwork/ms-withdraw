import populate_integrations_all from "../integrations/all";
import populate_customization_all from "../customization/all";
import populate_typography from "../typography/index";
import populate_wallet_all from "../wallet/all";

let populate_app_auth = [
    {
        path : 'currencies',
        model : 'Currency',
        select : { '__v': 0},
    },
    {
        path : 'casino_providers',
        model : 'Provider',
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
                select : { '__v': 0}
            },{
                path : 'balance',
                model : 'Balance',
                select : { '__v': 0}
            },
            {
                path : 'jackpot',
                model : 'Jackpot',
                select : { '__v': 0}
            },{
                path : 'txFee',
                model : 'TxFee',
                select : { '__v': 0}
            },{
                path : 'depositBonus',
                model : 'DepositBonus',
                select : { '__v': 0}
            },
            {
                path : 'pointSystem',
                model : 'PointSystem',
                select : { '__v': 0}
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
    },
    {   
        path : 'affiliateSetup',
        model : 'AffiliateSetup',
        select : { '__v': 0},
        populate : [
            {
                path : 'affiliateStructures',
                model : 'AffiliateStructure',
                select : { '__v': 0}
            },
            {
                path : 'customAffiliateStructures',
                model : 'AffiliateStructure',
                select : { '__v': 0}
            }
        ]
    },
    {
        path : 'integrations',
        model : 'Integrations',
        select : { '__v': 0 },
        populate : populate_integrations_all
    },
    {
        path : 'customization',
        model : 'Customization',
        select : { '__v': 0 },
        populate : populate_customization_all
    },
    {
        path : 'typography',
        model : 'Typography',
        select : { '__v': 0 },
        populate : populate_typography
    },
    {
        path : 'casino_providers',
        model : 'Provider',
        select : { '__v': 0}
    },
    {
        path : 'analytics',
        model : 'Analytics',
        select : { '__v': 0}
    }
] 

export default populate_app_auth;