import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { getAppUserWithdraws } from "../../methods";

import chai from 'chai';
const expect = chai.expect;

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
        let processed = 0;
        for(var i = 0; i < message.length; i++){
            if(message[i].status == 'Processed'){
                processed += 1;
            }
        }
        expect(processed).to.be.equal(2);

    }));

    it('should be able to get withdraws - filtered by in Queue', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            status : 'Queue'
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.equal(totalWithdraws-2);

    }));

    it('should be able to get withdraws - filtered by Processed', mochaAsync(async () => {
        let res = await getAppUserWithdraws({
            app : app.id,
            status : 'Processed'
        }, app.bearerToken , {id : app.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status, message } = res.data;
        expect(status).to.be.equal(200);
        expect(message.length).to.be.equal(2);

    }));
});
