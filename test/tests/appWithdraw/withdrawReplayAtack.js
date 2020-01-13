import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { appDepositToContract, appWithdrawFromContract } from "../../utils/eth";
import { requestAppWithdraw } from "../../methods";
import chai from 'chai';
import { appConfirmDeposit, loginAdmin, appWalletInfo } from "../../utils/env";
import Numbers from "../../logic/services/numbers";
const expect = chai.expect;

context('Withdraw Replay Atack', async () => {
    var app, contract, admin, admin_eth_account, appWallet, currency, contract;

    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        admin_eth_account = global.test.admin_eth_account;
        admin = global.test.admin;

        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Add Amount for User on Database */
        let app_deposit_transaction = await appDepositToContract({tokenAmount :  global.test.depositAmounts[global.test.ticker], currency, platformAddress : appWallet.bank_address});

        switch(new String(currency.ticker).toLowerCase()){
            case 'dai' : {
                contract = global.test.contract;
                break;
            };
            case 'eth' : {
                contract = global.test.contractETH;
                break;
            };
        }
        
        await appConfirmDeposit({
            app_id : app,
            transactionHash : app_deposit_transaction.transactionHash,
            amount :  global.test.depositAmounts[global.test.ticker],
            currency
        })
    });


    it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
        let wallet = await appWalletInfo({app_id : app.id});
        expect(parseFloat(wallet.playBalance)).to.be.equal(global.test.depositAmounts[global.test.ticker]);

        let res = requestAppWithdraw({
            tokenAmount :  global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});

        let res_replay_attack = await requestAppWithdraw({
            tokenAmount :  global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            address : admin_eth_account.getAddress(),
        }, app.bearerToken , {id : app.id});
        
        let ret = await Promise.resolve(await res);
        let status_1 = ret.data.status;
        const { status } = res_replay_attack.data;

        let dexWithdrawalAmount = await contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
        wallet = await appWalletInfo({app_id : app.id});

        expect(parseFloat(dexWithdrawalAmount)).to.be.equal(global.test.depositAmounts[global.test.ticker])
        expect(parseFloat(wallet.playBalance)).to.be.equal(0);
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
            platformAddress : appWallet.bank_address,
            account : admin_eth_account,
            currency, 
            address : admin_eth_account.getAddress(),
            tokenAmount : global.test.depositAmounts[global.test.ticker],
        });

        let wallet = await appWalletInfo({app_id : app.id});
        let dexWithdrawalAmount = await contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});

        expect(dexWithdrawalAmount).to.be.equal(0);
        expect(parseFloat(wallet.playBalance)).to.be.equal(0);
        expect(withdrawTxResponse).to.not.equal(false);
    }));
});
