const axios = require('axios');
import { throwError } from "../../../controllers/Errors/ErrorManager";
import { CryptoSingleton } from "./crypto";
import { USER_KEY, IS_DEVELOPMENT, MS_MASTER_URL, CRYPTO_API } from "../../../config";

class CryptoEthClass {
    constructor() {
        this.cryptoApi = CryptoSingleton.init();
        if (IS_DEVELOPMENT) { this.cryptoApi.BC.ETH.switchNetwork('rinkeby') }
        let network = this.cryptoApi.BC.ETH.getSelectedNetwork();
        console.log("NETWORK ETH : ", network)
    }

    async generateAccount(passphrase) {
        try {
            let account = await this.cryptoApi.BC.ETH.address.generateAccount(passphrase);
            console.log("account:: ", account)
            return account;
        } catch (err) {
            console.log("Error:: ", err)
            throwError('WEAK_PASSWORD')
        }
    }

    async getTransaction(txHash) {
        try {
            let transaction = await this.cryptoApi.BC.ETH.transaction.getTransaction(txHash);
            console.log("getTransaction:: ", transaction)
            console.log("getTransactionPayload:: ", transaction.payload.token_transfers)
            console.log("getTransactionPayload2:: ", transaction.payload.token_transfers[0])
            return transaction;
        } catch (err) {
            console.log(err)
        }
    }
    async addAppDepositWebhook({ address, app_id, currency_id, isApp }) {
        try {
            let url = `${MS_MASTER_URL}/api/user/webhookDeposit?id=${app_id}&currency=${currency_id}&isApp=${isApp}`
            let confirmations = 3
            let webhook = await this.cryptoApi.BC.ETH.webhook.createAddressTransactionWebHook(url, address, confirmations)
            console.log("addAppDepositWebhook:: ", webhook)
            return webhook;
        } catch (err) {
            console.log(err)
        }
    }
    async addAppDepositERC20Webhook({ address, app_id, currency_id, isApp }) {
        try {
            let url = `${MS_MASTER_URL}/api/user/webhookDeposit?id=${app_id}&currency=${currency_id}&isApp=${isApp}`
            let confirmations = 3
            let webhook = await this.cryptoApi.BC.ETH.webhook.createTokenWebHook(url, address, confirmations)
            console.log("addAppDepositWebhookERC20:: ", webhook)
            return webhook;
        } catch (err) {
            console.log(err)
        }
    }
    async generateDepositAddress() {
        try {
            let depositAddress = await this.cryptoApi.BC.ETH.address.generateAddress()
            console.log("depositAddress:: ", depositAddress)
            return depositAddress;
        } catch (err) {
            console.log(err)
        }
    }

    async getAddressInfo(address) {
        try {
            let addressInfo = await this.cryptoApi.BC.ETH.address.getInfo(address)
            console.log("addressInfo:: ", addressInfo)
            return addressInfo;
        } catch (err) {
            console.log(err)
        }
    }

    async createPaymentForwarding({ from, to, callbackURL, wallet, privateKey, confirmations }) {
        try {
            let network = this.cryptoApi.BC.ETH.getSelectedNetwork();
            console.log("NETWORK createPaymentForwarding : ", network)
            const headers = {
                'Content-Type': 'application/json',
                'X-API-Key': CRYPTO_API
              }
            const data = {
                "callback": callbackURL,
                "from": from,
                "to": to,
                "gasLimit" : 40000,
                "gasPrice" : 90000000000,
                "privateKey": privateKey,
                "confirmations": confirmations
            }
            let url = `https://api.cryptoapis.io/v1/bc/eth/${network}/payments`
            let createPaymentForwarding = await axios.post(url, data, { headers: headers });
            // let createPaymentForwarding = await this.cryptoApi.BC.ETH.paymentForwarding.createPaymentForwarding(from, to, callbackURL, wallet, privateKey, confirmations)
            console.log("createPaymentForwarding:: ", createPaymentForwarding.data)
            return createPaymentForwarding;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createPaymentForwardingToken({ from, to, callbackURL, wallet, privateKey, confirmations, token }) {
        try {
            console.log(privateKey);
            let network = this.cryptoApi.BC.ETH.getSelectedNetwork();
            console.log("NETWORK createPaymentForwarding : ", network)
            const headers = {
                'Content-Type': 'application/json',
                'X-API-Key': CRYPTO_API
            }
            const data = {
                "from_address": from,
                "to_address": to,
                "token": token,
                "callback_url": callbackURL,
                "from_address_credentials": {
                    "private_key": privateKey
                },
                "gasLimit" : 100000,
                "gasPrice" : 90000000000,
                "minimum_transfer_amount": 0.001,
                "confirmations": confirmations
            }
            let url = `https://api.cryptoapis.io/v1/bc/eth/${network}/tokens-forwarding/automations`;

            let createPaymentForwarding = await axios.post(url, data, { headers: headers });
            // let createPaymentForwarding = await this.cryptoApi.BC.ETH.paymentForwarding.createPaymentForwarding(from, to, callbackURL, wallet, privateKey, confirmations)
            console.log("createPaymentForwarding:: ", createPaymentForwarding.data)
            return createPaymentForwarding;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

var CryptoEthSingleton = new CryptoEthClass();

export {
    CryptoEthSingleton
}
