
let populate_app_convert_points = [
    {
        path : 'addOn',
        model : 'AddOn',
        select : { 
            '_id': 1,
            'pointSystem': 1
        },
        populate : [
            {
                path : 'pointSystem',
                model : 'PointSystem',
                select : { '__v': 0}
            }
        ]
    }
] 

export default populate_app_convert_points;