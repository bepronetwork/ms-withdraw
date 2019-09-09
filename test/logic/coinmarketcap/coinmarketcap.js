import request from 'request-promise';

const mapper_currency = {
    'btc' : 'bitcoin',
    'eth' : 'ethereum'
}

class Coinmarketcap{

    getETHPriceAPI = async () => {
        return JSON.parse(await request.get('https://api.coinmarketcap.com/v1/ticker/ethereum/'));
    }

    getEthereumPrice = async (eth_quantity) => {
        let response = await this.getETHPriceAPI();
        return parseFloat(eth_quantity)*parseInt(response[0].price_usd);
    }

    getCurrencyPriceInETH = async (currency) => {
        const CurrencyTicker = JSON.parse(await request.get('https://api.coinmarketcap.com/v1/ticker/' + currency));
        const ETHTicker = await this.getETHPriceAPI();
        const ethPrice = ETHTicker[0]['price_usd'];
        const currencyPrice = CurrencyTicker[0]['price_usd'];
        return (parseFloat(currencyPrice) / parseFloat(ethPrice));
    }

    
    getCurrencyPriceAPI = async (currency) => {
        return JSON.parse(await request.get('https://api.coinmarketcap.com/v1/ticker/' + mapper_currency[currency]));
    }

    getCurrencyPrice = async (currency, amount) => {
        const ticker = await this.getCurrencyPriceAPI(currency);
        const price = ticker[0]['price_usd'];
        let usd_value = parseFloat(amount * parseFloat(price));
        return parseFloat(usd_value).toFixed(2);
    }
}

let CoinmarketcapSingleton = new Coinmarketcap();

export default CoinmarketcapSingleton;