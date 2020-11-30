import { CryptoSingleton } from "./crypto";
import { throwError } from "../../../controllers/Errors/ErrorManager";
import { MS_MASTER_URL, IS_DEVELOPMENT } from "../../../config";

class CryptoBtcClass {
    constructor() {
        this.cryptoApi = CryptoSingleton.init();
        if(IS_DEVELOPMENT){this.cryptoApi.BC.BTC.switchNetwork(this.cryptoApi.BC.BTC.NETWORKS.TESTNET)}
        let network = this.cryptoApi.BC.BTC.getSelectedNetwork();
    }

    async createHDWallet({ label, passphrase }) {
        try {
            let name = label;
            let addressCount = 1;
            let password = passphrase;
            let wallet = await this.cryptoApi.BC.BTC.wallet.createHDWallet(name, addressCount, password);
            return wallet;
        } catch (err) {
            console.log("Error:: ", err)
            throwError('WEAK_PASSWORD')
        }
    }

    async getTransaction( txHash ) {
        try {
            let transaction = await this.cryptoApi.BC.BTC.transaction.getTransaction(txHash);
            return transaction;
        } catch (err) {
            console.log(err)
        }
    }
    async addAppDepositWebhook({ address, app_id, currency_id, isApp }) {
        try {
            let urlMaster = "https://ms-master-issue-666-zw4rzsgd95.herokuapp.com"; //TODO remove
            let url = `${urlMaster}/api/app/webhookDeposit?id=${app_id}&currency=${currency_id}&isApp=${isApp}`
            let confirmations = 3
            let webhook = await this.cryptoApi.BC.BTC.webhook.createAddressTransactionWebHook(url, address, confirmations)
            console.log("addAppDepositWebhookBTC:: ", webhook)
            return webhook;
        } catch (err) {
            console.log(err)
        }
    }
    async generateDepositAddress() {
        try {
            let depositAddress = await this.cryptoApi.BC.BTC.address.generateAddress()
            console.log("depositAddressBTC:: ", depositAddress)
            return depositAddress;
        } catch (err) {
            console.log(err)
        }
    }

    async importAddressAsWallet({ walletName, password, privateKey, address }) {
        try {
            let addressAsWallet = await this.cryptoApi.BC.BTC.wallet.importAddressAsWallet(walletName, password, privateKey, address)
            console.log("addressAsWallet:: ", addressAsWallet)
            return addressAsWallet;
        } catch (err) {
            console.log(err)
        }
    }

    async getAddressInfo(address) {
        try {
            let addressInfo = await this.cryptoApi.BC.BTC.address.getInfo(address)
            console.log("addressInfoBTC:: ", addressInfo)
            return addressInfo;
        } catch (err) {
            console.log(err)
        }
    }

    async addAppDepositWebhook({ address, app_id, currency_id, isApp }) {
        try {
            let url = `${MS_MASTER_URL}/api/user/webhookDeposit?id=${app_id}&currency=${currency_id}&isApp=${isApp}`
            let confirmations = 3
            let webhook = await this.cryptoApi.BC.BTC.webhook.createAddressTransactionWebHook(url, address, confirmations)
            console.log("webhookBTC:: ", webhook)
            return webhook;
        } catch (err) {
            console.log(err)
        }
    }

    async createPaymentForwarding({from, to, callbackURL, wallet, password, confirmations}) {
        try {
            let createPaymentForwarding = await this.cryptoApi.BC.BTC.paymentForwarding.createPaymentForwarding(from, to, callbackURL, wallet, password, confirmations)
            console.log("createPaymentForwardingBTC:: ", createPaymentForwarding)
            return createPaymentForwarding;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getTransaction(txHash) {
        try {
            let transaction = await this.cryptoApi.BC.BTC.transaction.getTransaction(txHash) ;
            console.log("getTransactionBTC:: ", transaction)
            return transaction;
        } catch (err) {
            console.log(err)
        }
    }
}

var CryptoBtcSingleton = new CryptoBtcClass();

export {
    CryptoBtcSingleton
}