let ERROR = 'Bet Setup is not Valid : ';

class Markets{
    constructor(){
    }

    marketBetResultVerifier = (type, result) => {
        try{
            if(!Array.isArray(result)){throw new Error(ERROR, result)}
            switch(type){
                case 1 : {
                    if(result.length > 1){throw new Error(ERROR, result)}
                    if(parseInt(result[0]) > 1){throw new Error(ERROR, result)}
                    return result;
                };
                case 2 : {
                    if(result.length > 36){throw new Error(ERROR, result)}
                    result.map( (number) => {
                        if(parseInt(number) <= 0 && parseInt(number) > 36){throw new Error(ERROR, result)}
                    })
                    return result;
                }
            }
        }catch(err){
            throw err;
        }
    }
}


let MarketsSingleton = new Markets();

export default MarketsSingleton;