import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addAutoWithdraw, editAutoWithdraw, depositWallet } from "../../utils/env";
import { requestUserWithdraw, getAppUserWithdraws, finalizeUserWithdraw } from "../../methods";
import chai from 'chai';
import { WithdrawRepository } from "../../../test/db/repos";
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

var autoWithdrawParams = {
    isAutoWithdraw : true,
    verifiedKYC : true,
    maxWithdrawAmountCumulative : 0.01,
    maxWithdrawAmountPerTransaction : 0.001 
}

context('Automatic Withdraw', async () => {
    var user, app, user_eth_account, contract, appWallet, currency, addAutomaticWithdraw, editAutomaticWithdraw, admin, bearerToken, ticker;

    before( async () =>  {

        app = global.test.app;
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
        /* Add AutoWithdraw to App */
        addAutomaticWithdraw = await addAutoWithdraw({admin_id : admin.id, app_id : app.id, bearerToken, payload : {id : admin.id}});
        /* Edit AutoWithdraw */
        editAutomaticWithdraw = await editAutoWithdraw({admin_id : admin.id, app_id : app.id, currency : app.currencies[0]._id, autoWithdrawParams, bearerToken, payload : {id : admin.id}});
    });

    it('should be able to make automatic withdraw', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[ticker]/20,
            nonce : 3456365755,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});
        let withdrawObject = await WithdrawRepository.prototype.findWithdrawById(res.data.message);
        expect(withdrawObject).to.be.not.null;
        expect(withdrawObject.confirmed).to.be.true;
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('shouldnt withdraw the same request twice', mochaAsync(async () => {

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, bearerToken , {id : admin.id});
        const { message } = withdraws_res.data;

        let res = await finalizeUserWithdraw({
            app : app.id,
            admin : admin.id,
            user : user.id,
            withdraw_id : message[0]._id,
            currency : currency._id
        }, admin.bearerToken , {id : admin.id});

        expect(res.data.status).to.equal(19);
    }));

    it('shouldnt be able to make automatic withdraw - Max Per Trasanction Was Reached', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[ticker]/2,
            nonce : 3456365751,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});
        let withdrawObject = await WithdrawRepository.prototype.findWithdrawById(res.data.message);
        expect(withdrawObject).to.be.not.null;
        expect(withdrawObject.confirmed).to.be.false;
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('shouldnt be able to make automatic withdraw - Max Amount Cumulative Was Reached', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[ticker]+0.001,
            nonce : 3456365751,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});
        let withdrawObject = await WithdrawRepository.prototype.findWithdrawById(res.data.message);
        expect(withdrawObject).to.be.not.null;
        expect(withdrawObject.confirmed).to.be.false;
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('should be edit automatic withdraw to false', mochaAsync(async () => {
        let autoWithdrawParams = {
            isAutoWithdraw : false,
            verifiedKYC : true,
            maxWithdrawAmountCumulative : 1,
            maxWithdrawAmountPerTransaction : 0.5 
        }
        let res = await editAutoWithdraw({
            admin_id : admin.id, 
            app_id : app.id, 
            currency : app.currencies[0]._id, 
            autoWithdrawParams, 
            bearerToken, 
            payload : {id : admin.id}
        });
        expect(res).to.be.not.null
    }));

    it('shouldnt make automatic withdraw (IsAutoWithdraw as False) - Make Request Withdraw', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[ticker]/4,
            nonce : 3456365752,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});
        let withdrawObject = await WithdrawRepository.prototype.findWithdrawById(res.data.message);
        expect(withdrawObject).to.be.not.null;
        expect(withdrawObject.confirmed).to.be.false;
        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(200)
    }));

    it('should Finalize the requested withdraw', mochaAsync(async () => {

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, bearerToken , {id : admin.id});
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
});
