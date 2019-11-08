import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestAppWithdraw } from "../../methods";
import chai from 'chai';
import {  appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

context('Withdraw 0', async () => {
    var app, contract, admin, admin_eth_account;

    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;      
    });


    it('shouldn´t be able to withdraw a 1 balance without depositing', mochaAsync(async () => {

        let res = await requestAppWithdraw({
            tokenAmount : 1,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});
        const { status } = res.data;

        let wallet = await appWalletInfo({app_id : app.id});
        let dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
        // Verify if middle states are met
        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(status).to.be.equal(21);
        expect(dexWithdrawalAmount).to.be.equal(0);
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(0);

    }));

});
