import {
	User
} from '../../models';
import MiddlewareSingleton from '../helpers/middleware';
import SecuritySingleton from '../helpers/security';
import { cryptoEth, cryptoBtc } from '../../logic/third-parties/cryptoFactory';
import { UsersRepository } from '../../db/repos';
import { SearchSingleton } from '../../logic/utils/search';


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

async function requestAffiliateWithdraw (req, res) {
    try{
        SecuritySingleton.verify({type : 'user', req});
        let params = req.body;
		let user = new User(params);
        let data = await user.requesAffiliatetWithdraw();
        MiddlewareSingleton.respond(res, req, data);
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
        console.log(":::Init webhook::: ", req);
        console.log(req.query);
        req.body.id = req.query.id;
        req.body.ticker = req.body.currency;
        req.body.currency = req.query.currency;
        req.body.isApp = req.query.isApp;
        let params = req.body;
        var dataTransaction = null;
        let user = null;
        let userWallet = null;
        let addressUser = null;
        switch ((req.body.ticker).toLowerCase()) {
            case 'eth':
                dataTransaction = await cryptoEth.CryptoEthSingleton.getTransaction(params.txHash);
                user            = await UsersRepository.prototype.findUserById(req.body.id, "wallet");
                console.log("user.wallet:: ", user.wallet);
                console.log("params1:: ",params );
                let tokenToWallet = (params.token_symbol == undefined ? (req.body.ticker).toLowerCase() : (params.token_symbol).toLowerCase());
                console.log("tokenToWallet ",tokenToWallet);
                userWallet      = user.wallet.find((w) => w.currency.ticker.toLowerCase() == tokenToWallet);
                addressUser     = userWallet.depositAddresses[0].address;

                if(tokenToWallet=="eth" && addressUser != dataTransaction.payload.to){
                    throwError("USER_ADDRESS_IS_NOT_VALID");
                }
                if(tokenToWallet!="eth" && !(dataTransaction.payload.token_transfers.find(w=>w.to==addressUser))){
                    throwError("USER_ADDRESS_IS_NOT_VALID");
                }
                break;
            case 'btc':
                params.txHash = params.txid;
                dataTransaction = await cryptoBtc.CryptoBtcSingleton.getTransaction(params.txHash);
                user            = await UsersRepository.prototype.findUserById(req.body.id, "wallet");
                userWallet      = user.wallet.find((w) => w.currency.ticker.toLowerCase() == "btc");
                addressUser     = userWallet.depositAddresses[0].address;
                let indexAddress = SearchSingleton.indexOfByObjectAddress(dataTransaction.payload.txouts, addressUser);
                if(indexAddress==-1) {
                    throwError("USER_ADDRESS_IS_NOT_VALID");
                }
                dataTransaction = {
                    payload: {
                        hash: dataTransaction.payload.txid,
                        status: "0x1",
                        to: dataTransaction.payload.txouts[indexAddress].addresses[0],
                        from: dataTransaction.payload.txins[0].addresses[0],
                        value: parseFloat(dataTransaction.payload.txouts[indexAddress].amount)
                    }
                }
                break;
            default:
                break;
        }
        if (!dataTransaction) { return null }
        params = { ...params, ...dataTransaction };

        let hooks = Array.isArray(params) ? params : [params];
        let data = await Promise.all(hooks.map(async wB => {
            try {
                let user = new User(params);
                return await user.updateWallet();
            } catch (err) {
                console.log(err);
                return err;
            }
        }))
        MiddlewareSingleton.respond(res, req, data);
    } catch (err) {
        // MiddlewareSingleton.log({type: "admin", req, code: err.code});
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

export {
    getDepositAddress,
    requestWithdraw,
    finalizeWithdraw,
    requestAffiliateWithdraw,
    cancelWithdraw,
    webhookDeposit
}