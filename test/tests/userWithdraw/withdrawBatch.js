import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { Logger } from "../../utils/logger";
import { createEthAccount, registerUser, userConfirmDeposit, loginUser } from "../../utils/env";
import { userDepositToContract, appWithdrawForUserBatch } from "../../utils/eth";
import { requestUserWithdraw, getAppUserWithdraws, finalizeUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw Batch Several Users', async () => {
    var user, user_2, app, user_eth_account, user_eth_account_2, contract, withdrawTxResponse;
    
    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;

        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});
        user_eth_account_2 = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});

        /* Create User on Database */
        user_2 = await registerUser({address : user_eth_account_2.getAddress(), app_id : app.id});
        user_2 = await loginUser({username : user_2.username, password : user_2.password, app_id : app.id});

        /* Add Amount for User on Database */
        let user_deposit_transaction = await userDepositToContract({eth_account : user_eth_account, tokenAmount : 5, platformAddress : contract.platformAddress});
        let user_deposit_transaction_2 = await userDepositToContract({eth_account : user_eth_account_2, tokenAmount : 5, platformAddress : contract.platformAddress});

        await userConfirmDeposit({
            app_id : app.id,
            user_id : user.id,
            transactionHash : user_deposit_transaction.transactionHash,
            amount : 5
        })

        await userConfirmDeposit({
            app_id : app.id,
            user_id : user_2.id,
            transactionHash : user_deposit_transaction_2.transactionHash,
            amount : 5
        })
    
    });


    it('should be able to ask to withdraw all amount', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : 5,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(200);

        res = await requestUserWithdraw({
            tokenAmount : 5,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account_2.getAddress(),
            user : user_2.id
        }, user_2.bearerToken , {id : user_2.id});
        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(200);
   
    }));

    it('should be able withdraw all Amount for all users', mochaAsync(async () => {
        /* Withdraw from Smart-Contract */
        withdrawTxResponse = await appWithdrawForUserBatch({
            addresses : [user_eth_account.getAddress(), user_eth_account_2.getAddress()],
            amounts : [5, 5],
            platformAddress : contract.platformAddress
        });

        expect(withdrawTxResponse).to.not.equal(false);
    }));


    it('should be able finalizeInfo for all withdraws and confirm it can´t be processed again', mochaAsync(async () => {

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id}, app.bearerToken , {id : app.id});
        let withdraws_res_2 = await getAppUserWithdraws({app : app.id, user : user_2.id}, app.bearerToken , {id : app.id});
        
        let res = await finalizeUserWithdraw({
            app : app.id,
            user : user.id,
            withdraw_id : withdraws_res.data.message[0]._id,
            transactionHash : withdrawTxResponse.transactionHash,
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(200);
        
        res = await finalizeUserWithdraw({
            app : app.id,
            user : user_2.id,
            withdraw_id : withdraws_res_2.data.message[0]._id,
            transactionHash : withdrawTxResponse.transactionHash,
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(200);
        
        res = await finalizeUserWithdraw({
            app : app.id,
            user : user_2.id,
            withdraw_id : withdraws_res_2.data.message[0]._id,
            transactionHash : withdrawTxResponse.transactionHash,
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(19);

        res = await finalizeUserWithdraw({
            app : app.id,
            user : user.id,
            withdraw_id : withdraws_res.data.message[0]._id,
            transactionHash : withdrawTxResponse.transactionHash,
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        expect(res.data.status).to.be.equal(19);

    }));
});
