import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser } from "../../utils/env";
import { requestUserWithdraw, editKycNeeded } from "../../methods";
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
});
