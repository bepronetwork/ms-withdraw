
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
                select : { '__v': 0}
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
                        select : { '__v': 0}
                    }
                ]
            }
        ]
    }
] 

export default populate_affiliateLink;