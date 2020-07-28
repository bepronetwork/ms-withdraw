import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw, finalizeAppWithdraw, getAppAuth } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

context('Withdraw Replay Atack', async () => {
    var app, admin, admin_eth_account, appWallet, currency, app_withdraw;

    before( async () =>  {
        app = global.test.app;
        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
    });


    it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
    
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        let balance = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase()).playBalance;

        const initialBalance = balance;
        const deposit = initialBalance/5;

        // Deposit Succeeded
        expect(parseFloat(balance).toFixed(6)).to.not.equal(0);

        let res = requestAppWithdraw({
            tokenAmount :  deposit, 
            nonce : 3456365756,
            currency : currency._id,
            app : app.id,
            admin: admin.id,
            address : admin_eth_account.getAddress(),
        }, admin.bearerToken , {id : admin.id});

        let res_replay_attack = await requestAppWithdraw({
            tokenAmount : deposit, 
            nonce : 3456365756,
            app : app.id,
            admin : admin.id,
            currency : currency._id,
            address : admin_eth_account.getAddress(),
        }, admin.bearerToken , {id : admin.id});
        
        let ret = await Promise.resolve(await res);
        const status_1 = ret.data.status;
        const message_1 = ret.data.message;

        const { status , message } = res_replay_attack.data;

        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        balance = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase()).playBalance;

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

        expect(parseFloat(balance).toFixed(6)).to.be.equal(parseFloat(initialBalance-deposit).toFixed(6));
        expect(detectValidationErrors(res_replay_attack)).to.be.equal(false);

    }));

    it('should be able withdraw all Amount', mochaAsync(async () => {

        let res = await finalizeAppWithdraw({
            app : app.id,
            admin : admin.id,
            withdraw_id : app_withdraw._id,
            currency : currency._id
        }, admin.bearerToken , {id : admin.id});
        expect(res.data.status).to.equal(200);
        expect(res.data.message.transactionHash).to.not.be.null;
    }));
});
