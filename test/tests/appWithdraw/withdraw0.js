import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw, getAppAuth } from "../../methods";
import chai from 'chai';
import {  appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

context('Withdraw 0', async () => {
    var app, contract, admin, admin_eth_account, appWallet, currency;
    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;

        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;      
    });


    it('shouldn´t be able to withdraw a 1 balance without depositing', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
        let previousBalance =  app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase()).playBalance;

        let res = await requestAppWithdraw({
            tokenAmount : global.test.depositAmounts[global.test.ticker]*30,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
            currency : currency._id
        }, app.bearerToken , {id : app.id});
        const { status } = res.data;

        app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
        let wallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        var dexWithdrawalAmount;
        
        switch(new String(currency.ticker).toLowerCase()){
            case 'dai' : {
                dexWithdrawalAmount = await global.test.contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
                break;
            };
            case 'eth' : {
                dexWithdrawalAmount = await global.test.contractETH.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
                break;
            };
        }
        // Verify if middle states are met
        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(status).to.be.equal(21);
        expect(parseFloat(dexWithdrawalAmount)).to.be.equal(0);
        expect(parseFloat(wallet.playBalance)).to.be.equal(previousBalance);

    }));

});
