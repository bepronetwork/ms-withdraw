import { editAppMailSenderIntegration } from "../../methods";
import chai from 'chai';
import { mochaAsync } from '../../../utils';
const expect = chai.expect;

context('Mail Sender', async () =>  {
    var app;


    before( async () =>  {
        app = global.test.app;
    });

    it('shouldn´t update the Mail Sender integration info from app - Wrong API Key', mochaAsync(async () => {
        let postData = {
            app : app.id,
            "apiKey" : "retertert",
            "templateIds" : [
                { "template_id": 1, "futionName": "USER_LOGIN", "connctionName": "USER_REGISTER", "contactlist_Id"  : 2 },
                { "template_id": 2, "functactlist_Id"  : 2 },
                { "template_id": 1, "functionName": "USER_RESET_PASSWORD", "contactlist_Id"  : 2 }
            ]
        }
        let res = await editAppMailSenderIntegration(postData, app.bearerToken , {id : app.id});
        expect(res.data.status).to.equal(404);
    }));

    it('should update the Mail Sender integration info from app', mochaAsync(async () => {
        let postData = {
            app : app.id,
            "apiKey" : "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",
            "templateIds" : [
                { "template_id": 1, "functionName": "USER_REGISTER", "contactlist_Id"  : 2 },
                { "template_id": 2, "functionName": "USER_LOGIN", "contactlist_Id"  : 2 },
                { "template_id": 1, "functionName": "USER_RESET_PASSWORD", "contactlist_Id"  : 2 }
            ]
        }
        let res = await editAppMailSenderIntegration(postData, app.bearerToken , {id : app.id});
        expect(res.data.status).to.equal(200);
    }));
});
