
export const getCurrencyAmountToBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseInt(parseFloat(amount)*1000000000000000000);
        };
        case 'btc' : {
            // to satoshi
            return parseInt(parseFloat(amount)*100000000);
        };
        case 'usdc' : {
            // to 6 
            return parseInt(parseFloat(amount)*1000000);
        };
        case 'usdt' : {
            // to 6
            return parseInt(parseFloat(amount)*1000000);
        };
        case 'dai' : {
            // to 18
            return parseInt(parseFloat(amount)*1000000000000000000);
        };
        case 'fft' : {
            console.log("fft", parseInt(parseFloat(amount)*1000000000000000000));
            // to 18
            return parseInt(parseFloat(amount)*1000000000000000000);
        };
    }
}


export const getCurrencyAmountFromBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseFloat(parseFloat(amount)/1000000000000000000);
        };
        case 'btc' : {
            // to satoshi
            return parseFloat(parseFloat(amount)/100000000);
        };
        case 'usdc' : {
            // to 6 
            return parseFloat(parseFloat(amount)/1000000);
        };
        case 'usdt' : {
            // to 6
            return parseFloat(parseFloat(amount)/1000000);
        };
        case 'dai' : {
            // to 18
            return parseFloat(parseFloat(amount)/1000000000000000000);
        };
         case 'fft' : {
            // to 18
            return parseFloat(parseFloat(amount)/1000000000000000000);
        };
    }
}


export const getNormalizedTicker = ({ticker}) => {    
    return new String(ticker.substr(0)).toLowerCase();
}
