import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { appDepositToContract, appWithdrawFromContract } from "../../utils/eth";
import { requestAppWithdraw } from "../../methods";
import chai from 'chai';
import { appConfirmDeposit, loginAdmin, appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

context('Withdraw Some Amount', async () => {
    var app, contract, admin, admin_eth_account;

    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;
        /* Add Amount for User on Database */
        let app_deposit_transaction = await appDepositToContract({tokenAmount : 5, casinoContract : contract.casino});

        await appConfirmDeposit({
            app_id : app.id,
            transactionHash : app_deposit_transaction.transactionHash,
            amount : 5
        })
    });


    it('should be able to ask to withdraw part of the all amount', mochaAsync(async () => {
        let wallet = await appWalletInfo({app_id : app.id});
        let dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
        // Verify if initial states are met
        expect(dexWithdrawalAmount).to.be.equal(0);
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(5);

        let res = await requestAppWithdraw({
            tokenAmount : 3,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});
        const { status } = res.data;

        wallet = await appWalletInfo({app_id : app.id});
        dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
        // Verify if middle states are met
        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(status).to.be.equal(200);
        expect(dexWithdrawalAmount).to.be.equal(3);
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(2);

    }));

    it('should be able withdraw all Amount', mochaAsync(async () => {
        /* Withdraw from Smart-Contract */
        let withdrawTxResponse = await appWithdrawFromContract({
            casinoContract : contract.casino,
            account : admin_eth_account,
            address : admin_eth_account.getAddress(),
            tokenAmount : 3
        });

        let wallet = await appWalletInfo({app_id : app.id});
        let dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});

        expect(dexWithdrawalAmount).to.be.equal(0);
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(2);
        expect(withdrawTxResponse).to.not.equal(false);
    }));
});
