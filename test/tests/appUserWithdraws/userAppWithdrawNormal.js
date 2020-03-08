import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { getAppUserWithdraws } from "../../methods";

import chai from 'chai';
const expect = chai.expect;

const TOTAL_WITHDRAWS = 6;

context('Get App Users Withdraw Normal', async () => {
    var app, admin, totalWithdraws;
    
    before( async () =>  {
        app = global.test.app;
        admin = global.test.admin;
    });


    it('should be able to get withdraws', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            admin: admin.id,
        }, admin.bearerToken , {id : admin.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        totalWithdraws = message.length;
    }));

    it('should be able to get withdraws - filtered by in Queue', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            admin: admin.id,
            status : 'Queue'
        }, admin.bearerToken , {id : admin.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.greaterThan(0);

    }));

    it('should be able to get withdraws - filtered by Processed', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            admin: admin.id,
            status : 'Processed'
        }, admin.bearerToken , {id : admin.id});
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.greaterThan(0);

    }));
});
