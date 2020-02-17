const BitGo = require('bitgo');
import { BITGO_ACCESS_TOKEN, IS_DEVELOPMENT, BITGO_ENTERPRISE_ID, MS_MASTER_URL, QUOTA_GUARD_URL } from '../../../config';
import { getCurrencyAmountFromBitGo, getCurrencyAmountToBitGo } from './helpers';

class BitGoClass {
    constructor(){
        this.bitgo = new BitGo.BitGo({ accessToken: BITGO_ACCESS_TOKEN, proxy : QUOTA_GUARD_URL, env : IS_DEVELOPMENT ? 'test' : 'prod' });
    }

    async __init__(){
        this.session = await this.bitgo.session();
    }

    async createWallet({label, passphrase, currency}){
        const currencyTicker = `${IS_DEVELOPMENT ? 't' : ''}${new String(currency).toLowerCase()}`;
        /* All test wallets start with t${currency_name} --- t behind the currency ex : tbtc */
        var { wallet, userKeychain, backupKeychain, bitgoKeychain } = await this.bitgo.coin(currencyTicker).wallets().generateWallet({label, passphrase, enterprise : BITGO_ENTERPRISE_ID});
    
        // Wait for wallet tx init - force delay
        wallet = await this.getWallet({ticker : currency, id : wallet.id()});
    
        return { 
            wallet, 
            receiveAddress : wallet._wallet.coinSpecific.baseAddress,
            keys : { 
                user : userKeychain, 
                backup : backupKeychain, 
                bitgo : bitgoKeychain
            } 
        };
    }

    async getWallet({ticker, id}){
        const currencyTicker = `${IS_DEVELOPMENT ? 't' : ''}${new String(ticker).toLowerCase()}`;
        return await this.bitgo.coin(currencyTicker).wallets().get({id});
    }

    async getTransaction({id, wallet_id, ticker}){
        const wallet = await this.getWallet({ticker, id : wallet_id});
        var res = await wallet.getTransfer({ id });
        // Update Amount based on the type of Wei or Sats
        res.value = getCurrencyAmountFromBitGo({ticker, amount : res.value});
        return res;
    }

    async sendTransaction({wallet_id, ticker, amount, address, passphrase}){
        const wallet = await this.getWallet({id : wallet_id, ticker});
        return await wallet.send({
            amount: new String(getCurrencyAmountToBitGo({ticker, amount})).trim().toString(),
            address: address,
            walletPassphrase : passphrase
        });
      
    }

}


var BitGoSingleton = new BitGoClass();

export default BitGoSingleton;
