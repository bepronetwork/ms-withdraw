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
        let dataMaxDeposit = await setAppMaxWithdraw({
            app_id: app.id,
            wallet_id: appWallet._id,
            amount: 0.01,
        }, app.bearerToken, {id : app.id});
        expect(dataMaxDeposit.data.status).to.be.equal(200);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));
    it('should set max for SAI success', mochaAsync(async () => {
        updateCurrencyWallet('DAI', app);
        let dataMaxDeposit = await setAppMaxWithdraw({
            app_id: app.id,
            wallet_id: appWallet._id,
            amount: 0.01,
        }, app.bearerToken, {id : app.id});
        expect(dataMaxDeposit.data.status).to.be.equal(200);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));
});
