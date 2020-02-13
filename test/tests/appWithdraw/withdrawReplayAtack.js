import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw, finalizeAppWithdraw } from "../../methods";
import chai from 'chai';
import { appWalletInfo, depositWallet } from "../../utils/env";
const expect = chai.expect;

context('Withdraw Replay Atack', async () => {
    var app, admin, admin_eth_account, appWallet, currency, app_withdraw;

    before( async () =>  {
        app = global.test.app;
        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Add Amount for User on Database */
        await depositWallet({wallet_id : appWallet._id, amount : global.test.depositAmounts[global.test.ticker]});

    });


    it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
        let wallet = await appWalletInfo({app_id : app.id});
        expect(parseFloat(wallet.playBalance)).to.be.equal(global.test.depositAmounts[global.test.ticker]);

        let res = requestAppWithdraw({
            tokenAmount :  global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            currency : currency._id,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});

        let res_replay_attack = await requestAppWithdraw({
            tokenAmount :  global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            currency : currency._id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});
        
        let ret = await Promise.resolve(await res);
        const status_1 = ret.data.status;
        const message_1 = ret.data.message;

        const { status , message } = res_replay_attack.data;

        wallet = await appWalletInfo({app_id : app.id});

        expect(parseFloat(wallet.playBalance)).to.be.equal(0);
        expect(detectValidationErrors(res_replay_attack)).to.be.equal(false);

        // Confirm either one or the other tx got phroibited
        if(status_1 == 200){
            expect(status_1).to.be.equal(200)
            expect(status).to.be.equal(14)
            app_withdraw = message_1;
        }else{
            expect(status_1).to.be.equal(14)
            expect(status).to.be.equal(200)
            app_withdraw = message;
        }

    }));

    it('should be able withdraw all Amount', mochaAsync(async () => {

        let res = await finalizeAppWithdraw({
            app : app.id,
            withdraw_id : app_withdraw._id,
            currency : currency._id
        }, app.bearerToken , {id : app.id});
        expect(res.data.status).to.equal(200);
        expect(res.data.message.transactionHash).to.not.be.null;
    }));
});
