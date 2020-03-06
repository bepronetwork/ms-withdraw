import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { requestUserWithdraw, finalizeUserWithdraw, getAppUserWithdraws } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.05,
        token_balance : 5,
    }
}

context('Withdraw All Amount', async () => {

    global.test.currencies.forEach( async ticker => {
        describe(`${ticker}`, async () => {
            var user, app, user_eth_account, contract, appWallet, currency, admin;
            
            before( async () =>  {

                app = global.test.app;
                admin = global.test.admin;
                contract = global.test.contract;
                appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
                currency = appWallet.currency;

                /* Create User Address and give it ETH */
                user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});
                /* Create User on Database */
                user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
                user = await loginUser({username : user.username, password : user.password, app_id : app.id});
                let userWallet = user.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
                /* Add Amount for User on Database */
                await depositWallet({wallet_id : userWallet._id, amount : global.test.depositAmounts[ticker]});
            });

            it('should be able to ask to withdraw all amount', mochaAsync(async () => {
                let res = await requestUserWithdraw({
                    tokenAmount : global.test.depositAmounts[ticker],
                    nonce : 3456365756,
                    app : app.id,
                    address : user_eth_account.getAddress(),
                    user : user.id,
                    currency : currency._id
                }, user.bearerToken , {id : user.id});

                expect(detectValidationErrors(res)).to.be.equal(false);
                const { status } = res.data;
                expect(status).to.be.equal(200)
            }));

            it('should be able withdraw all Amount', mochaAsync(async () => {
                /* Withdraw from Smart-Contract */

                let withdraws_res = await getAppUserWithdraws({app : app.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
                const { message } = withdraws_res.data;

                let res = await finalizeUserWithdraw({
                    app : app.id,
                    user : user.id,
                    admin : admin.id,
                    withdraw_id : message[0]._id,
                    currency : currency._id
                }, admin.bearerToken , {id : admin.id});

                expect(res.data.status).to.equal(200);
            }));
        });
    });
});
