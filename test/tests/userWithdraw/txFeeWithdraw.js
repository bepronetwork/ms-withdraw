import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addTxFee, editTxFee, depositWallet } from "../../utils/env";
import { requestUserWithdraw, getAppAuth, getUser } from "../../methods";
import chai from 'chai';
import { WithdrawRepository } from "../../db/repos";
const expect = chai.expect;

const initialState = {
    user: {
        eth_balance: 0.12,
        token_balance: 5,
    }
}

var txFeeParams = {
    isTxFee: true,
    deposit_fee: 0.0002,
    withdraw_fee: 0.0002
}

context('Tx Fee', async () => {
    var user, app, user_eth_account, contract, appWallet, currency, addTxFeeResult, editTxFeeResult, admin, bearerToken, ticker, userWallet, userInfo, walletUserInfo;

    before(async () => {

        app = global.test.app;
        admin = global.test.admin;
        bearerToken = admin.bearerToken;
        contract = global.test.contract;
        ticker = new String(global.test.ticker).toLowerCase();
        appWallet = app.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
        currency = appWallet.currency;
        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ ethAmount: initialState.user.eth_balance });
        /* Create User on Database */
        user = await registerUser({ address: user_eth_account.getAddress(), app_id: app.id });
        /* Gets User Info */
        user = await loginUser({ username: user.username, password: user.password, app_id: app.id });
        userWallet = user.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
        /* Add Amount for User on Database */
        await depositWallet({ wallet_id: userWallet._id, amount: (global.test.depositAmounts[ticker] + 0.01) });
        global.test.user = user;
        global.test.user_eth_account = user_eth_account;
        userInfo = (await getUser({ app: app.id, user: user.id, admin: admin.id, currency: currency._id }, admin.bearerToken, { id: admin.id })).data.message;
        walletUserInfo = userInfo.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
        app = (await getAppAuth({ app: app.id, admin: admin.id }, admin.bearerToken, { id: admin.id })).data.message;
        appWallet = app.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
        /* Add AutoWithdraw to App */
        addTxFeeResult = await addTxFee({ admin_id: admin.id, app_id: app.id, bearerToken, payload: { id: admin.id } });
        /* Edit AutoWithdraw */
        editTxFeeResult = await editTxFee({ admin_id: admin.id, app_id: app.id, currency: app.currencies[0]._id, txFeeParams, bearerToken, payload: { id: admin.id } });
    });

    it('should be able to ask withdraw with fee (Update User and App Wallet)', mochaAsync(async () => {
        let initialPlayBalanceApp = appWallet.playBalance;
        let initialPlayBalanceUser = walletUserInfo.playBalance;
        let res = await requestUserWithdraw({
            tokenAmount: global.test.depositAmounts[ticker] / 2,
            nonce: 3452345756,
            app: app.id,
            address: user_eth_account.getAddress(),
            user: user.id,
            currency: currency._id
        }, user.bearerToken, { id: user.id });

        /* Find Request Withdraw By Id to see amount of this */
        let withdraw = await WithdrawRepository.prototype.findWithdrawById(res.data.message);

        /* Auth user to get new wallet status info */
        userInfo = (await getUser({ app: app.id, user: user.id, admin: admin.id, currency: currency._id }, admin.bearerToken, { id: admin.id })).data.message;
        walletUserInfo = userInfo.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());

        /* Auth App to get new wallet status info */
        app = (await getAppAuth({ app: app.id, admin: admin.id }, admin.bearerToken, { id: admin.id })).data.message;
        appWallet = app.wallet.find(w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());

        expect(withdraw.amount).to.be.equal((global.test.depositAmounts[ticker] / 2) - (txFeeParams.withdraw_fee))
        expect(walletUserInfo.playBalance).to.be.equal(initialPlayBalanceUser - (global.test.depositAmounts[ticker] / 2))
        expect(appWallet.playBalance).to.be.equal(initialPlayBalanceApp + (txFeeParams.withdraw_fee))
    }));

    it('shouldnt be able to ask withdraw with fee (Whithdraw less than Fee)', mochaAsync(async () => {
        let res = await requestUserWithdraw({
            tokenAmount: 0.0001,
            nonce: 34523451256,
            app: app.id,
            address: user_eth_account.getAddress(),
            user: user.id,
            currency: currency._id
        }, user.bearerToken, { id: user.id });
        expect(res.data.status).to.be.equal(49);
    }));
});
