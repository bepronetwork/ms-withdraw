import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { Logger } from "../../utils/logger";
import { createEthAccount, registerUser, userConfirmDeposit, loginUser, addWalletAffiliate } from "../../utils/env";
import { userDepositToContract } from "../../utils/eth";
import { requestUserAffiliateWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw No Funds', async () => {
    var user, app, user_eth_account, contract;
    
    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;

        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});

        /* Add Amount for User on Database */
        await addWalletAffiliate({user, amount: 3});
    
    });


    it('shouldn´t be able to withdraw a superior to available balance', mochaAsync(async () => {

        let res = await requestUserAffiliateWithdraw({
            tokenAmount : 10,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(21)
    }));
});
