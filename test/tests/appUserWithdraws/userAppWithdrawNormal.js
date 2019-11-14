import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { getAppUserWithdraws } from "../../methods";

import chai from 'chai';
const expect = chai.expect;

const TOTAL_WITHDRAWS = 6;

context('Get App Users Withdraw Normal', async () => {
    var app, totalWithdraws;
    
    before( async () =>  {
        app = global.test.app;
    });


    it('should be able to get withdraws', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        
        totalWithdraws = message.length;
    }));

    it('should be able to get withdraws - filtered by in Queue', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            status : 'Queue'
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.equal(totalWithdraws-TOTAL_WITHDRAWS);

    }));

    it('should be able to get withdraws - filtered by Processed', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            status : 'Processed'
        }, app.bearerToken , {id : app.id});
        console.log(res);
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.equal(TOTAL_WITHDRAWS);

    }));
});
