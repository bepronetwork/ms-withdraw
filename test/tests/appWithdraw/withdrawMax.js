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
    var app, admin_eth_account, admin, currency;

    before( async () =>  {
        app = global.test.app;
        updateCurrencyWallet('ETH', app);
        currency = appWallet.currency;

        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
    });

    it('should set max for ETH success', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.security.bearerToken, {id : admin.id})).data.message;
        let dataMaxDeposit = await setAppMaxWithdraw({
            app         : app.id,
            admin       : admin.id,
            wallet_id   : appWallet._id,
            amount      : 20,
        }, admin.security.bearerToken, {id : admin.id});
        expect(dataMaxDeposit.data.status).to.be.equal(200);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));

    it('should set max for ETH not auth', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.security.bearerToken, {id : admin.id})).data.message;
        let dataMaxDeposit = await setAppMaxWithdraw({
            admin       : admin.id,
            app         : app.id,
            wallet_id   : appWallet._id,
            amount      : 20,
        }, null, {id : admin.id});
        expect(dataMaxDeposit.data.status).to.be.equal(304);
        expect(dataMaxDeposit.data.status).to.not.be.null;
    }));

});
