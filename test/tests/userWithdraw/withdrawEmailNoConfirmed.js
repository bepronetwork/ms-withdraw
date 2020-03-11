import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser } from "../../utils/env";
import { requestUserWithdraw, confirmEmail } from "../../methods";
import chai from 'chai';
import MiddlewareSingleton from "../../../src/api/helpers/middleware";
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw Email no confirmed', async () => {
    var user, app, user_eth_account, contract, appWallet, currency;

    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance});
        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id}, false);
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
    });

    it('should email_confirmed is false', mochaAsync(async () => {
        expect(user.email_confirmed).to.be.equal(false);
    }));

    it('should Email no Confirmed', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            app : app.id,
            tokenAmount : 0.01,
            nonce : 2334549,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(47);
    }));

    it('should Request To Confirm Email', mochaAsync(async () => {
        const res = await confirmEmail({
            token   : MiddlewareSingleton.generateTokenEmail(user.email)
        });
        expect(res.data.status).to.not.null;
        expect(res.data.status).to.equal(200);
    }));


    it('should Withdraw With Email Confirmed', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            app : app.id,
            tokenAmount : 0.001,
            nonce : 2334550,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(21);
    }));
});
