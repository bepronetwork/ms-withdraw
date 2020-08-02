import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b"));

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
            console.log("fft", amount, parseInt(parseFloat(amount)*1000000000000000000), web3.utils.toWei(new String(amount).toString(), 'ether'));
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
