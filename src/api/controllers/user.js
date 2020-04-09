import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';
import { writeFile } from '../helpers/file';


async function requestWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'user', req});
        let params = req.body;
        let user = new User(params);

        let verifyAutoWithdraw                      = await user.verifyIfIsAutoWithdraw();
        let verifyMaxWithdrawAmountCumulative       = verifyAutoWithdraw.verify ? await user.verifyMaxWithdrawAmountCumulative() : {verify: false, textError: verifyAutoWithdraw.textError};
        let verifyMaxWithdrawAmountPerTransaction   = verifyAutoWithdraw.verify ? await user.verifyMaxWithdrawAmountPerTransaction() : {verify: false, textError: verifyAutoWithdraw.textError};
        let verifyEmailConfirmed                    = verifyAutoWithdraw.verify ? await user.verifyEmailConfirmed() : {verify: false, textError: verifyAutoWithdraw.textError};

        let textError = [verifyAutoWithdraw, verifyMaxWithdrawAmountCumulative, verifyMaxWithdrawAmountPerTransaction, verifyEmailConfirmed];
        textError = textError.find( t => t.verify == false );
        textError = (textError == null || textError == undefined) ? "Success" : textError.textError
        let userRequest = new User({...params, textError});

        let withdraw_id = await userRequest.requestWithdraw();

        if(verifyAutoWithdraw.verify && verifyMaxWithdrawAmountCumulative.verify && verifyMaxWithdrawAmountPerTransaction.verify && verifyEmailConfirmed.verify){
            let userFinalizeWithdraw = new User({...params, withdraw_id})
            await userFinalizeWithdraw.finalizeWithdraw();
        }
        let data = withdraw_id;
        writeFile({functionName : 'requestWithdraw', content : data});
        MiddlewareSingleton.respond(res, data);
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
        writeFile({functionName : 'requestAffiliateWithdraw', content : data});
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
        writeFile({functionName : 'finalizeWithdraw', content : data});
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