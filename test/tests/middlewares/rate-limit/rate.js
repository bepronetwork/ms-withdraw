import {
    pingPostMiddleware, pingPost
} from '../../../methods';

import { mochaAsync } from "../../../utils/testing";
import chai from 'chai';
import delay from 'delay';
const expect = chai.expect;

context('Rate-Limit', async () => {
    var app;

    before( async () =>  {
        app = {
            id: "5e486f7b85e6fa0021c827d7"
        }
    });

    it('should max 100 request per secund', mochaAsync(async () => {
        for(let i=0;i<=100; i++){
            pingPostMiddleware({type: "global", app: app.id}, {}, {});
        }
        var res = await pingPostMiddleware({type: "global", app: app.id}, {}, {});
        expect(res.status).to.equal(429);
    }));

    it('should should after 1 minute', mochaAsync(async () => {
        await delay(60*1000);
        var res = await pingPost({type: "global", app: app.id}, {}, {});
        expect(res.data.status).to.equal(200);
    }));
});

