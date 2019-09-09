import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw No User', async () => {
    var  app;

    before( async () =>  {
        app = global.test.app;
    });

    it('shouldn´t be able to withdraw a 1 balance without depositing', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            tokenAmount : 1,
            nonce : 3456365756,
            app : app.id,
            address : '0x',
            user : 'erew'
        }, null , {id : null });

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(304)
    }));
});
