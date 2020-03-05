import populate_integrations_all from "../integrations/all";

let populate_app_affiliates = [
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
] 

export default populate_app_affiliates;