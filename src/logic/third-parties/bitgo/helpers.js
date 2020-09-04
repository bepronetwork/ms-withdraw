import Web3 from 'web3';
import CurrencyRepository from '../../../db/repos/currency';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b"));

export const getCurrencyAmountToBitGo = async ({ticker, amount}) => {
    const dataTicker = await CurrencyRepository.prototype.findByTicker(ticker);
    return parseInt(parseFloat(amount)*(10 ** dataTicker.decimals));
}

export const getCurrencyAmountFromBitGo = ({ticker, amount}) => {
    const dataTicker = await CurrencyRepository.prototype.findByTicker(ticker);
    return parseFloat(parseFloat(amount)/(10 ** dataTicker.decimals));
}

export const getNormalizedTicker = ({ticker}) => {
    return new String(ticker.substr(0)).toLowerCase();
}
