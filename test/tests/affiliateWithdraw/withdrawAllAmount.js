import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addWalletAffiliate } from "../../utils/env";
import { userWithdrawFromContract } from "../../utils/eth";
import { requestUserAffiliateWithdraw } from "../../methods";

import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 6,
    }
}

context('Withdraw Min Passed', async () => {
    var user, app, user_eth_account, contract;
    
    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;

        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});

        await addWalletAffiliate({user, amount : 5});
    });


    it('should be able to ask to withdraw all amount', mochaAsync(async () => {
        let res = await requestUserAffiliateWithdraw({
            tokenAmount : 5,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('should be able withdraw all Amount', mochaAsync(async () => {
        /* Withdraw from Smart-Contract */
        let withdrawTxResponse = await userWithdrawFromContract({
            eth_account : user_eth_account,
            tokenAmount : 5,
            platformAddress : contract.platformAddress
        })

        expect(withdrawTxResponse).to.not.equal(false);
    }));
});
