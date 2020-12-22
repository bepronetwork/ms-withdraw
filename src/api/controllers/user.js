import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';
import {TRUSTOLOGY_WEBHOOK_KEY_ETH, TRUSTOLOGY_WEBHOOK_KEY_BTC} from "../../config"
import { convertDataSingleton } from '../helpers/convertData';
import { UsersRepository, WalletsRepository } from '../../db/repos';


async function finalizeWithdraw (req, res) {
    try{
        SecuritySingleton.verifyServeToServe(req);
        let params = req.body;
        let user = new User(params);
        let data = await user.finalizeWithdraw();
        MiddlewareSingleton.respond(res, req, data);
	}catch(err){
        MiddlewareSingleton.respondError(res, err);
	}
}
async function webhookDeposit(req, res) {
    try {
        const params = convertDataSingleton.getDataWebHook(req);
        SecuritySingleton.checkWebhook(req, params.type=="BTC" ? TRUSTOLOGY_WEBHOOK_KEY_BTC : TRUSTOLOGY_WEBHOOK_KEY_ETH);
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
        console.log("0 ", req.body);
        console.log("1 ", params);
        console.log("2 ",params.data);
        console.log("3 ",params.data.subWalletIdString);
        for(let transaction of listTransactions) {
            if(transaction.data.transactionType=="RECEIVED"){
                try {
                    let user = new User({...transaction});
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
        req.body.user = req.body.id;
        await SecuritySingleton.verify(req);
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
    finalizeWithdraw,
    webhookDeposit
}