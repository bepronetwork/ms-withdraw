import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw No Funds', async () => {
    var user, app, user_eth_account, contract, appWallet, currency;
    
    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
        let userWallet = user.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());

        /* Add Amount for User on Database */
        await depositWallet({wallet_id : userWallet._id, amount : global.test.depositAmounts[global.test.ticker]});
    });


    it('shouldn´t be able to withdraw a superior to available balance', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[global.test.ticker]*10,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(21)
    }));
});
