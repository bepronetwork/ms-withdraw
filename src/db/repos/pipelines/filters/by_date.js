const pipeline_bets_by_date = ({from_date, to_date}) => {
    if((!from_date) || (!to_date)){return {}};
    return  {
        '$match' : {
            'timestamp' : { '$gte' : from_date,  '$lte': to_date}
        }
    }
}


export {
    pipeline_bets_by_date
}



