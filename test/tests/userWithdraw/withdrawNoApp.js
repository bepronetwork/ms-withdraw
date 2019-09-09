import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { Logger } from "../../utils/logger";
import { createEthAccount, registerUser, loginUser } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw No App Present', async () => {
    var user, app, user_eth_account, contract;

    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;

        /* Create User on Database */
        user = await registerUser({address : "0x", app_id : app.id});
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
    });

    it('shouldn´t be able to withdraw a 1 balance without depositing', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : 1,
            nonce : 3456365756,
            app : 'asdf0a',
            address : '0x',
            user : user.id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(404)
    }));
});
