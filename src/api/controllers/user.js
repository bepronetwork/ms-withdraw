import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';
import {TRUSTOLOGY_WEBHOOK_KEY} from "../../config"
import { convertDataSingleton } from '../helpers/convertData';


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
        // Verify auth of webhook
        // SecuritySingleton.checkWebhook(req, TRUSTOLOGY_WEBHOOK_KEY);

        const params = convertDataSingleton.getDataWebHook(req);

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
            params.data
        ];

        for(let transaction of listTransactions) {
            if(transaction.data.transactionType=="RECEIVED"){
                try {
                    let user = new User(transaction);
                    data.push((await user.updateWallet()));
                } catch(error) {
                    console.log("error ", error);
                }
            }
        }

        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
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