import {
    App,
    Wallet
} from '../../models';
import SecuritySingleton from '../helpers/security';
import MiddlewareSingleton from '../helpers/middleware';
import BitGoSingleton from '../../logic/third-parties/bitgo';
import { getNormalizedTicker } from '../../logic/third-parties/bitgo/helpers';

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
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin"] });
        let params = req.body;
        let app = new App(params);
        let data = await app.requestWithdraw();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

async function setMaxWithdraw(req, res) {
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin"] });
        let params = req.body;
        let wallet = new Wallet(params);
        let data = await wallet.setMaxWithdraw();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

/**
 *
 * @param {*} req
 * @param {*} res
 */

async function webhookBitgoDeposit(req, res) {
    try {
        req.body.id = req.query.id;
        req.body.currency = req.query.currency;
        let params = req.body;
        let hooks = Array.isArray(params) ? params : [params];
        let data = await Promise.all(hooks.map(async wB => {
            try {
                // Get Info from WebToken
                const wBT = await BitGoSingleton.getTransaction({ id: wB.transfer, wallet_id: wB.wallet, ticker: getNormalizedTicker({ ticker: wB.coin }) });
                if (!wBT) { return null }
                // Verify if it is App or User Deposit /Since the App deposit is to the main MultiSign no label is given to specific address, normally label = ${user_od}
                var isApp = !wBT.label;
                params.wBT = wBT;
                let app = new App(params);
                return await app.updateWallet();
            } catch (err) {
                console.log(err);
                return err;
            }
        }))
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        // MiddlewareSingleton.log({type: "admin", req, code: err.code});
        MiddlewareSingleton.respondError(res, err);
    }
}

async function setMinWithdraw(req, res) {
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin"] });
        let params = req.body;
        let wallet = new Wallet(params);
        let data = await wallet.setMinWithdraw();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

async function setAffiliateMinWithdraw(req, res) {
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin"] });
        let params = req.body;
        let wallet = new Wallet(params);
        let data = await wallet.setAffiliateMinWithdraw();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

async function finalizeAppWithdraw(req, res) {
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin"] });
        let params = req.body;
        let app = new App(params);
        let data = await app.finalizeWithdraw();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

async function getUserWithdraws(req, res) {
    try {
        SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin", "withdraw"] });
        let params = req.body;
        let app = new App(params);
        let data = await app.getUserWithdraws();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err);
    }
}

async function addCurrencyWallet(req, res) {
    try {
        await SecuritySingleton.verify({ type: 'admin', req, permissions: ["super_admin", "financials"] });
        let params = req.body;
        let app = new App(params);
        let data = await app.addCurrencyWallet();
        MiddlewareSingleton.log({ type: "admin", req, code: 200 });
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.log({ type: "admin", req, code: err.code });
        MiddlewareSingleton.respondError(res, err, req);
    }
}

export {
    requestAppWithdraw,
    finalizeAppWithdraw,
    getUserWithdraws,
    setMaxWithdraw,
    setMinWithdraw,
    setAffiliateMinWithdraw,
    webhookBitgoDeposit,
    addCurrencyWallet
};