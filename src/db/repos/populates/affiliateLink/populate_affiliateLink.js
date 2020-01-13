import populate_wallet_all from "../wallet/all";

let populate_affiliateLink = [
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
    },
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
    }
] 

export default populate_affiliateLink;