import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';
import {TRUSTOLOGY_WEBHOOK_KEY_ETH, TRUSTOLOGY_WEBHOOK_KEY_BTC} from "../../config"
import { convertDataSingleton } from '../helpers/convertData';
import { UsersRepository, WalletsRepository } from '../../db/repos';


async function requestWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'user', req});
        let params = req.body;
        let user = new User(params);
        let data = await user.requestWithdraw();
        MiddlewareSingleton.respond(res, req, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}
async function cancelWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'admin', req, permissions: ["super_admin"]});
        let params = req.body;
		let user = new User(params);
        let data = await user.cancelWithdraw();
        MiddlewareSingleton.respond(res, req, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}
async function webhookDeposit(req, res) {
    try {

        const params = convertDataSingleton.getDataWebHook(req);
        console.log(">>>>>>> 1 checkWebhook");
        console.log(params.type);
        console.log("1 req.body", req.body);
        SecuritySingleton.checkWebhook(req, params.type=="BTC" ? TRUSTOLOGY_WEBHOOK_KEY_BTC : TRUSTOLOGY_WEBHOOK_KEY_ETH);
        console.log("3 req.body", req.body);
        console.log(">>>>>>> 2 checkWebhook");
        let data = [];

        let listTransactions = params.isToken ? params.data.tokensData.map((item)=> {
            return {
                type: params.type,
                isToken: params.isToken,
                data:{
                    amount:parseFloat(item.quantity),
                    tx:params.data.tx,
                    subWalletIdString:params.data.subWalletIdString,
                    transactionType:item.tokenDirectionType,
                    symbol:item.symbol
                }
            }
        }) : [
            params
        ];

        let walletReal = await WalletsRepository.prototype.findWalletBySubWalletId(params.data.subWalletIdString);
        let userTemp   = await UsersRepository.prototype.findByWallet(walletReal._id);
        for(let transaction of listTransactions) {
            if(transaction.data.transactionType=="RECEIVED"){
                try {
                    let user = new User({...transaction, id: userTemp._id});
                    data.push((await user.updateWallet()));
                } catch(error) {
                    console.log("error ", error);
                }
            }
        }

        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        console.log("error 2", err);
        MiddlewareSingleton.respondError(res, err, req);
    }
}
async function getDepositAddress(req, res) {
    try {
        let params = req.body;
        let user = new User(params);
        let data = await user.getDepositAddress();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err, req);
    }
}

async function getTransactions(req, res) {
    try {
        let params = req.body;
        let user = new User(params);
        let data = await user.getTransactions();
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        MiddlewareSingleton.respondError(res, err, req);
    }
}

export {
    getTransactions,
    getDepositAddress,
    requestWithdraw,
    cancelWithdraw,
    webhookDeposit
}