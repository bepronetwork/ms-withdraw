import Web3 from 'web3';
import CurrencyRepository from '../../../db/repos/currency';
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b"));
import { IS_DEVELOPMENT } from "../../../config";

export const getCurrencyAmountToBitGo = async ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return web3.utils.toWei(new String(amount).toString(), 'ether');
        };
        case 'btc' : {
            // to satoshi
            return parseInt(parseFloat(amount)*100000000);
        }
    };
            
    const dataTicker = await CurrencyRepository.prototype.findByTicker(ticker);
    return parseInt(parseFloat(amount)*(10 ** dataTicker.decimals));
}

export const getCurrencyAmountFromBitGo = async ({ticker, amount}) => {
    const dataTicker = await CurrencyRepository.prototype.findByTicker(ticker);
    return parseFloat(parseFloat(amount)/(10 ** dataTicker.decimals));
}

export const getNormalizedTicker = ({ticker}) => {    
    return IS_DEVELOPMENT ? new String(ticker.substr(1)).toLowerCase() : ticker;
}
