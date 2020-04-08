import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addAutoWithdraw, editAutoWithdraw, depositWallet } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';
import { WithdrawRepository } from "../../../test/db/repos";
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
        await depositWallet({wallet_id : userWallet._id, amount : global.test.depositAmounts[ticker]});
        global.test.user = user;
        global.test.user_eth_account = user_eth_account;
        /* Add AutoWithdraw to App */
        addAutomaticWithdraw = await addAutoWithdraw({admin_id : admin.id, app_id : app.id, bearerToken, payload : {id : admin.id}});
        /* Edit AutoWithdraw */
        editAutomaticWithdraw = await editAutoWithdraw({admin_id : admin.id, app_id : app.id, currency : app.currencies[0]._id, autoWithdrawParams, bearerToken, payload : {id : admin.id}});
    });

    it('should be able to make automatic withdraw', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount : global.test.depositAmounts[ticker]/2,
            nonce : 3456365756,
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
});
