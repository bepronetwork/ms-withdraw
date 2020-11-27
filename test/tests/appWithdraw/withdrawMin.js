import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { getAppAuth, setAppMinWithdraw, requestUserWithdraw, getAppUserWithdraws, finalizeUserWithdraw } from "../../methods";
import chai from 'chai';
import KycRepository from "../../../src/db/repos/kyc";
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw Min', async () => {
    var user, app, user_eth_account, contract, appWallet, currency, admin, bearerToken, ticker;

    before( async () =>  {
        app = global.test.app;
        console.log("appIntegrations:: ", app.integrations.kyc._id)
        await KycRepository.prototype.findByIdAndUpdateIsActive(app.integrations.kyc._id ,true);
        admin = global.test.admin;
        bearerToken = admin.bearerToken;
        contract = global.test.contract;
        ticker = new String(global.test.ticker).toLowerCase();
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance});
        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
        let userWallet = user.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
        /* Add Amount for User on Database */
        await depositWallet({wallet_id : userWallet._id, amount : (global.test.depositAmounts[ticker]+ 0.01)});
        global.test.user = user;
        global.test.user_eth_account = user_eth_account;
    });

    it('should set Min for ETH success', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        let res = await setAppMinWithdraw({
            app         : app.id,
            admin       : admin.id,
            wallet_id   : appWallet._id,
            amount      : 0.00002,
        }, admin.bearerToken, {id : admin.id});
        expect(res.data.status).to.be.equal(200);
        expect(res.data.status).to.not.be.null;
    }));

    it('should set Min for ETH not auth', mochaAsync(async () => {
        app = (await getAppAuth({app : app.id, admin: admin.id}, admin.bearerToken, {id : admin.id})).data.message;
        let res = await setAppMinWithdraw({
            admin       : admin.id,
            app         : app.id,
            wallet_id   : appWallet._id,
            amount      : 0.00002,
        }, null, {id : admin.id});
        expect(res.data.status).to.be.equal(304);
        expect(res.data.status).to.not.be.null;
    }));

    it('should be able to ask to withdraw some amount - More than minimum withdrawal', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : 0.00003,
            nonce : 34563371965759,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('should be able withdraw some Amount', mochaAsync(async () => {

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
        const { message } = withdraws_res.data;

        let res = await finalizeUserWithdraw({
            app : app.id,
            admin : admin.id,
            user : user.id,
            withdraw_id : message[0]._id,
            currency : currency._id
        }, admin.bearerToken , {id : admin.id});

        expect(res.data.status).to.equal(200);
    }));

    it('should be able to ask to withdraw some amount - Equal minimum withdrawal', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : 0.00002,
            nonce : 3456365758,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('should be able withdraw some Amount', mochaAsync(async () => {

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
        const { message } = withdraws_res.data;

        let res = await finalizeUserWithdraw({
            app : app.id,
            admin : admin.id,
            user : user.id,
            withdraw_id : message[0]._id,
            currency : currency._id
        }, admin.bearerToken , {id : admin.id});

        expect(res.data.status).to.equal(200);
    }));

    it('shouldnt be able to ask to withdraw some amount - Less than minimum withdrawal', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : 0.00001,
            nonce : 3456365757,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(48)
    }));

});
