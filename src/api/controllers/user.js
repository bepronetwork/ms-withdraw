import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';


async function requestWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'user', req});
        let params = req.body;
        let user = new User(params);

        let verifyAutoWithdraw                      = await user.verifyIfIsAutoWithdraw();
        let verifyMaxWithdrawAmountCumulative       = await user.verifyMaxWithdrawAmountCumulative();
        let verifyMaxWithdrawAmountPerTransaction   = await user.verifyMaxWithdrawAmountPerTransaction()
        let verifyEmailConfirmed                    = await user.verifyEmailConfirmed();

        let textError = [verifyAutoWithdraw, verifyMaxWithdrawAmountCumulative, verifyMaxWithdrawAmountPerTransaction, verifyEmailConfirmed];
        textError = textError.find( t => t.verify == false ).textError;

        let userRequest = new User({...params, textError});

        let withdraw_id = await userRequest.requestWithdraw();

        if(verifyAutoWithdraw.verify && verifyMaxWithdrawAmountCumulative.verify && verifyMaxWithdrawAmountPerTransaction.verify && verifyEmailConfirmed.verify){
            let userFinalizeWithdraw = new User({...params, withdraw_id})
            await userFinalizeWithdraw.finalizeWithdraw();
        }
        MiddlewareSingleton.respond(res, withdraw_id);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

async function requestAffiliateWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'user', req});
        let params = req.body;
		let user = new User(params);
        let data = await user.requesAffiliatetWithdraw();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

async function finalizeWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin", "user_withdraw"]});
        let params = req.body;
		let user = new User(params);
        let data = await user.finalizeWithdraw();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

export {
    requestWithdraw,
    finalizeWithdraw,
    requestAffiliateWithdraw
}