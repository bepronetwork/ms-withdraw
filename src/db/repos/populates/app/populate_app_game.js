let populate_app_game = [
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
        path : 'casino_providers',
        model : 'Provider',
        select : { '__v': 0}
    }
]

export default populate_app_game;