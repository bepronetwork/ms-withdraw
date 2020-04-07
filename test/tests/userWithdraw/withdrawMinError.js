import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;


const WITHDRAW_AMOUNT = 1;

context('Withdraw under min allowed', async () => {
    var user, app, user_eth_account, currency, appWallet;
    
    before( async () =>  {
        app = global.test.app;
        user = global.test.user;
        user_eth_account = global.test.user_eth_account;    
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
    });


    it('shouldn´t be able to ask to withdraw some amount', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : WITHDRAW_AMOUNT,
            nonce : 3456365756,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(40)
    }));
});
