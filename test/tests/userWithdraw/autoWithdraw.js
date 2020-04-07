import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addAutoWithdraw, editAutoWithdraw } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

const autoWithdrawParams = {
    isAutoWithdraw : true,
    verifiedKYC : true,
    maxWithdrawAmountCumulative : 1,
    maxWithdrawAmountPerTransaction : 0.5 
}

context('Automatic Withdraw', async () => {
    var user, app, user_eth_account, contract, appWallet, currency, addAutomaticWithdraw, editAutomaticWithdraw, admin;

    before( async () =>  {

        app = global.test.app;
        admin = global.test.admin;
        contract = global.test.contract;
        appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance});
        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        /* Gets User Info */
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
        /* Add AutoWithdraw to App */
        addAutomaticWithdraw = await addAutoWithdraw({admin_id : admin.id, app_id : app.id, bearerToken: admin.app.bearerToken, payload : {id : admin.id}});
        /* Edit AutoWithdraw */
        editAutomaticWithdraw = await editAutoWithdraw({admin_id : admin.id, app_id : app.id, currency : app.currencies[0]._id, autoWithdrawParams, bearerToken: admin.app.bearerToken, payload : {id : admin.id}});
        console.log("editAutomaticWithdraw:: ",editAutomaticWithdraw)
    });


    it('should be able to make automatic withdraw', mochaAsync(async () => {

        let res = await requestUserWithdraw({
            app : app.id,
            tokenAmount : 0.0000001,
            nonce : 2334539,
            address : user_eth_account.getAddress(),
            user : user.id,
            currency : currency._id
        }, user.bearerToken , {id : user.id});

        expect(detectValidationErrors(res)).to.be.equal(false);
        const { status } = res.data;
        expect(status).to.be.equal(2)
    }));
});
