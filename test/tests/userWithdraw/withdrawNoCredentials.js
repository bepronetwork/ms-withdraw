import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { registerUser, loginUser } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

context('Withdraw No Credentials', async () => {
    var user, app, appWallet, currency;

    before( async () =>  {

        app = global.test.app;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User on Database */
        user = await registerUser({address : "0x", app_id : app.id});
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});

    });


    it('shouldn´t be able to withdraw, no BearerToken ', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            address : '0x',
            user : user.id,
            currency : currency._id
        }, null , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(304)
    }));


    it('shouldn´t be able to withdraw, wrong payload ', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            address : '0x',
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : '0x'});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(304)
    }));
});
