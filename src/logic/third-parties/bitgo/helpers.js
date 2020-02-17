
export const getCurrencyAmountToBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseFloat(amount)*1000000000000000000;
        };
        case 'btc' : {
            // to satoshi
            return parseFloat(amount)*100000000;
        }
    }
}


export const getCurrencyAmountFromBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseFloat(amount)/1000000000000000000;
        };
        case 'btc' : {
            // to satoshi
            return parseFloat(amount)/100000000;
        }
    }
}


export const getNormalizedTicker = ({ticker}) => {    
    return new String(ticker.substr(0)).toLowerCase();
}