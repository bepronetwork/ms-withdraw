import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { appDepositToContract, appWithdrawFromContract } from "../../utils/eth";
import { requestAppWithdraw } from "../../methods";
import chai from 'chai';
import { appConfirmDeposit, loginAdmin, appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

context('Withdraw Replay Atack', async () => {
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


    it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
        let wallet = await appWalletInfo({app_id : app.id});
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(5);

        let res = requestAppWithdraw({
            tokenAmount : 5,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});

        let res_replay_attack = await requestAppWithdraw({
            tokenAmount : 5,
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});
        
        let ret = await Promise.resolve(await res);
        let status_1 = ret.data.status;
        const { status } = res_replay_attack.data;

        let dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
        wallet = await appWalletInfo({app_id : app.id});

        expect(Numbers.toFloat(dexWithdrawalAmount)).to.be.equal(5)
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(0);
        expect(detectValidationErrors(res_replay_attack)).to.be.equal(false);

        // Confirm either one or the other tx got phroibited
        if(status_1 == 200){
            expect(status_1).to.be.equal(200)
            expect(status).to.be.equal(14)
        }else{
            expect(status_1).to.be.equal(14)
            expect(status).to.be.equal(200)
        }

    }));

    it('should be able withdraw all Amount', mochaAsync(async () => {

        /* Withdraw from Smart-Contract */
        let withdrawTxResponse = await appWithdrawFromContract({
            casinoContract : contract.casino,
            account : admin_eth_account,
            address : admin_eth_account.getAddress(),
            tokenAmount : 5
        });

        let wallet = await appWalletInfo({app_id : app.id});
        let dexWithdrawalAmount = await contract.casino.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});

        expect(dexWithdrawalAmount).to.be.equal(0);
        expect(Numbers.toFloat(wallet.playBalance)).to.be.equal(0);
        expect(withdrawTxResponse).to.not.equal(false);
    }));
});
