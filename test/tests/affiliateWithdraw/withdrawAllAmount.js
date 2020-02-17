import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addWalletAffiliate } from "../../utils/env";
import { requestUserAffiliateWithdraw, finalizeUserWithdraw, getAppUserWithdraws } from "../../methods";

import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 6,
    }
}

context('Withdraw All Amount', async () => {
    global.test.currencies.forEach( async ticker => {
        describe(`${ticker}`, async () => {
            var user, app, user_eth_account, contract, withdrawTxResponse, appWallet, currency, withdraws_res;
            before( async () =>  {

                app = global.test.app;
                contract = global.test.contract;
                appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(global.test.ticker).toLowerCase());
                currency = appWallet.currency;
                /* Create User Address and give it ETH */
                user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

                /* Create User on Database */
                user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
                user = await loginUser({username : user.username, password : user.password, app_id : app.id});

                await addWalletAffiliate({user, amount : global.test.depositAmounts[global.test.ticker], currency});
            });


            it('should be able to ask to withdraw all amount', mochaAsync(async () => {
                let res = await requestUserAffiliateWithdraw({
                    tokenAmount : global.test.depositAmounts[global.test.ticker]/4,
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

                let withdraws_res = await getAppUserWithdraws({app : app.id }, app.bearerToken , {id : app.id});
                const { message } = withdraws_res.data;

                let res = await finalizeUserWithdraw({
                    app : app.id,
                    user : user.id,
                    withdraw_id : message[0]._id,
                    currency : currency._id
                }, app.bearerToken , {id : app.id});

                expect(res.data.status).to.equal(200);
                expect(res.data.message.tx).to.not.be.null;

            }));
        });
    });
});
