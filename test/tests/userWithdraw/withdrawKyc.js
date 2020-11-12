import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { requestUserWithdraw, editKycNeeded, getAppUserWithdraws, finalizeUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw Kyc', async () => {
    var user, app, user_eth_account, contract, appWallet, currency, admin;

    before( async () =>  {
        app = global.test.app;
        contract = global.test.contract;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance});
        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
        admin = global.test.admin;

        let userWallet = user.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        /* Add Amount for User on Database */
        await depositWallet({wallet_id : userWallet._id, amount : (global.test.depositAmounts[global.test.ticker]+ 0.001)});

    });

    it('should kyc_needed==true ', mochaAsync(async () => {

        let postData = {
            admin      : admin.id,
            user       : user.id,
            kyc_needed : true
        }
        let res1 = await editKycNeeded(postData , admin.bearerToken , {id : admin.id});
        expect(res1.data.status).to.equal(200);

        let res = await requestUserWithdraw({
            app : app.id,
            tokenAmount : 22,
            nonce : 23345356,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        const { status } = res.data;
        expect(status).to.be.equal(51);

        res1 = await editKycNeeded({...postData, kyc_needed: false} , admin.bearerToken , {id : admin.id});
        expect(res1.data.status).to.equal(200);

    }));

    it('should try confirm withdraw with kyc_status!=verified', mochaAsync(async () => {

        let postData = {
            admin      : admin.id,
            user       : user.id,
            kyc_needed : false
        }
        let res1 = await editKycNeeded(postData , admin.bearerToken , {id : admin.id});
        expect(res1.data.status).to.equal(200);

        let res = await requestUserWithdraw({
            app : app.id,
            tokenAmount : 0.001,
            nonce : 23345356,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        const { status } = res.data;
        expect(status).to.be.equal(200);

        let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
        const { message } = withdraws_res.data;

        let res2 = await finalizeUserWithdraw({
            app : app.id,
            admin : admin.id,
            user : user.id,
            withdraw_id : message[0]._id,
            currency : currency._id
        }, admin.bearerToken , {id : admin.id});
        expect(res2.data.status).to.be.equal(51);
    }));
});
