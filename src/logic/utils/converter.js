import CoinmarketcapSingleton from "../coinmarketcap/coinmarketcap";

const __rates = {
    // Each BPRO Costs x in Currency
    eth : 0.00002,
}

 /**
     * @class Converter
     * @param {fuctions} convertToBPRO
     * @return {bool || Exception}  
*/

class Converter{

    toUSD = async (currency, amount) => {
        return await CoinmarketcapSingleton.getCurrencyPrice(currency, amount)
    }
}


let ConverterSingleton = new Converter();

export default ConverterSingleton;