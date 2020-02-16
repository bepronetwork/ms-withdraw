import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw, getAppAuth, setAppMaxWithdraw } from "../../methods";
import chai from 'chai';
import {  appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

var appWallet;

function updateCurrencyWallet(localTicker, app) {
    appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(localTicker).toLowerCase());
}

context('Withdraw Max', async () => {
    var app, contract, admin, admin_eth_account, currency;
    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        updateCurrencyWallet('ETH', app);
        currency = appWallet.currency;

        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
    });

    it('should set max for ETH success', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
        let dataMaxDeposit = await setAppMaxWithdraw({
            app         : app.id,
            wallet_id   : appWallet._id,
            amount      : 20,
        }, app.bearerToken, {id : app.id});
        expect(dataMaxDeposit.data.status).to.be.equal(200);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));

    it('should amount > max withdraw ETH', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
        updateCurrencyWallet('ETH', app);
        currency = appWallet.currency;
        let res = await requestAppWithdraw({
            tokenAmount : 22,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
            currency : currency._id
        }, app.bearerToken , {id : app.id});
        expect(res.data.status).to.not.be.null;
        expect(res.data.status).to.be.equal(46);
    }));

    it('should set max for ETH not auth', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
        let dataMaxDeposit = await setAppMaxWithdraw({
            app         : app.id,
            wallet_id   : appWallet._id,
            amount      : 20,
        }, null, {id : app.id});
        expect(dataMaxDeposit.data.status).to.be.equal(304);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));

});
