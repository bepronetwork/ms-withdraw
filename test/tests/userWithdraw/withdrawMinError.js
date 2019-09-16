import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { loginUser } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;


const WITHDRAW_AMOUNT = 1;

context('Withdraw under min allowed', async () => {
    var user, app, user_eth_account, contract;
    
    before( async () =>  {
        
        app = global.test.app;
        contract = global.test.contract;
        user = global.test.user;
        user_eth_account = global.test.user_eth_account;

        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
    
    });


    it('shouldn´t be able to ask to withdraw some amount', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : WITHDRAW_AMOUNT,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(40)
    }));
});
