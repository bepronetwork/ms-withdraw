import { mochaAsync } from "../../utils/testing";
import { getAppAuth, setAppMaxWithdraw, setAppMinWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

var appWallet;

function updateCurrencyWallet(localTicker, app) {
    appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(localTicker).toLowerCase());
}

context('Withdraw Min', async () => {
    var app, admin_eth_account, admin, currency;

    before( async () =>  {
        app = global.test.app;
        updateCurrencyWallet('ETH', app);
        currency = appWallet.currency;

        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
    });

    it('should set Min for ETH success', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        let res = await setAppMinWithdraw({
            app         : app.id,
            admin       : admin.id,
            wallet_id   : appWallet._id,
            amount      : 0.00002,
        }, admin.bearerToken, {id : admin.id});
        expect(res.data.status).to.be.equal(200);
        expect(res.data.status).to.not.be.null;
    }));

    it('should set Min for ETH not auth', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        let res = await setAppMinWithdraw({
            admin       : admin.id,
            app         : app.id,
            wallet_id   : appWallet._id,
            amount      : 0.00002,
        }, null, {id : admin.id});
        expect(res.data.status).to.be.equal(304);
        expect(res.data.status).to.not.be.null;
    }));

});
