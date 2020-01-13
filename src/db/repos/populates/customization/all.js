
let populate_customization_all = [
    {
        path : 'topBar',
        model : 'TopBar',
        select : { '__v': 0},
    },
    {
        path : 'banners',
        model : 'Banners',
        select : { '__v': 0},
    },
    {
        path : 'logo',
        model : 'Logo',
        select : { '__v': 0},
    },
    {
        path : 'colors',
        model : 'Color',
        select : { '__v': 0},
    },
    {
        path : 'footer',
        model : 'Footer',
        select : { '__v': 0},
        populate : [
            {
                path : 'supportLinks',
                model : 'Link',
                select : { '__v': 0}
            },
            {
                path : 'communityLinks',
                model : 'Link',
                select : { '__v': 0}
            },
        ]
    },
] 

export default populate_customization_all;