import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw, finalizeAppWithdraw, getAppAuth } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

context('Withdraw All Amount', async () => {

    global.test.currencies.forEach( async ticker => {
        describe(`${ticker}`, async () => {

            var app, contract, admin, admin_eth_account, app_withdraw, appWallet, currency, contract;

            before( async () =>  {
                app = global.test.app;
                contract = global.test.contract;

                appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
                currency = appWallet.currency;
                
                admin_eth_account = global.test.admin_eth_account;
                admin = global.test.admin;
            });

            it('should be able to ask to withdraw all amount', mochaAsync(async () => {
                app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
                let previousBalance = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase()).playBalance;
                
                app_withdraw = await requestAppWithdraw({
                    tokenAmount : previousBalance/4,
                    app : app.id,
                    address : admin_eth_account.getAddress(),
                    nonce  : 235934,
                    currency : currency._id
                }, app.bearerToken , {id : app.id});
                const { status } = app_withdraw.data;

                app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
                let balance = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase()).playBalance;
    
                // Verify if middle states are met
                expect(detectValidationErrors(app_withdraw)).to.be.equal(false);
                expect(status).to.be.equal(200);
                expect(parseFloat(balance)).to.be.equal(parseFloat(previousBalance-previousBalance/4));

            }));
    
            it('should be able withdraw all Amount', mochaAsync(async () => {                
                let res = await finalizeAppWithdraw({
                    app : app.id,
                    withdraw_id : app_withdraw.data.message._id,
                    currency : currency._id
                }, app.bearerToken , {id : app.id});

                expect(res.data.status).to.equal(200);
                expect(res.data.message.transactionHash).to.not.be.null;
            }));
        });
    });
});
