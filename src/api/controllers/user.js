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
        let data = await user.requestWithdraw();
        MiddlewareSingleton.respond(res, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}

export {
    requestWithdraw
}