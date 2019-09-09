
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

    convertToBPRO = (currency_amount, currency_type) => {
        switch(currency_type){
            case 'eth' : {
                return parseInt(currency_amount/__rates[currency_type]);
            }
        }
    }
}


let ConverterSingleton = new Converter();

export default ConverterSingleton;