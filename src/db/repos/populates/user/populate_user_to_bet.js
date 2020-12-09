import populate_wallet_all from "../wallet/all";

let populate_user_to = [
    {
        path : 'wallet',
        model : 'Wallet',
        select : { '__v': 0},
        populate : populate_wallet_all
    },
    {
        path : 'affiliate',
        model : 'Affiliate',
        select : { '__v': 0},
        populate : [
            {
                path : 'wallet',
                model : 'Wallet',
                select : { '__v': 0},
                populate : populate_wallet_all
            }
        ]
    },
    {
        path : 'affiliateLink',
        model : 'AffiliateLink',
        select : { '__v': 0},
        populate : [
            {
                path : 'parentAffiliatedLinks',
                model : 'AffiliateLink',
                select : { '__v': 0},
                populate : [
                    {
                        path : 'affiliateStructure',
                        model : 'AffiliateStructure',
                        select : { '__v': 0}
                    },
                    {
                        path : 'affiliate',
                        model : 'Affiliate',
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
            },
            {
                path : 'affiliateStructure',
                model : 'AffiliateStructure',
                select : { '__v': 0}
            },
        ]
    }
]

export default populate_user_to;