import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

context('Withdraw No User', async () => {
    var  app, currency;

    before( async () =>  {
        app = global.test.app;
        currency = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase()).currency;
    });

    it('shouldn´t be able to withdraw a 1 balance without depositing', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[global.test.ticker],
            nonce : 3456365756,
            app : app.id,
            address : '0x',
            user : 'erew',
            currency : currency._id
        }, null , {id : null });

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(304)
    }));
});
