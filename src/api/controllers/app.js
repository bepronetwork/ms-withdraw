import {
    App,
    Wallet
} from '../../models';
import SecuritySingleton from '../helpers/security';
import MiddlewareSingleton from '../helpers/middleware';

/**
 * Description of the function.
 *
 * @class
 * @memberof api.controllers.Apps.postApp
 * @requires lodash
 * @requires helpers/apiError
 * @requires helpers/swagger.generateParamsErrorObject
 * @todo Add description of AppsController
 */

async function requestAppWithdraw(req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin"]});
        let params = req.body;
		let app = new App(params);
        let data = await app.requestWithdraw();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

async function setMaxWithdraw(req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin"]});
        let params = req.body;
        let wallet = new Wallet(params);
        let data = await wallet.setMaxWithdraw();
        MiddlewareSingleton.respond(res, data);
	} catch(err) {
        MiddlewareSingleton.respondError(res, err);
	}
}

async function finalizeAppWithdraw(req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin"]});
        let params = req.body;
		let app = new App(params);
		let data = await app.finalizeWithdraw();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

async function getUserWithdraws(req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin", "withdraw"]});
        let params = req.body;
		let app = new App(params);
		let data = await app.getUserWithdraws();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

export {
    requestAppWithdraw,
    finalizeAppWithdraw,
    getUserWithdraws,
    setMaxWithdraw
};