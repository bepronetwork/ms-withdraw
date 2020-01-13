import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, addWalletAffiliate } from "../../utils/env";
import { appWithdrawForUser } from "../../utils/eth";
import { requestUserAffiliateWithdraw, getAppUserWithdraws, finalizeUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}


context('Withdraw Some Amount', async () => {

    global.test.currencies.forEach( async ticker => {

        describe(`${ticker}`, async () => {
            var user, app, user_eth_account, contract, currency, appWallet;
            before( async () =>  {

            app = global.test.app;
            contract = global.test.contract;
            appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
            currency = appWallet.currency;

            /* Create User Address and give it ETH */
            user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

            /* Create User on Database */
            user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
            user = await loginUser({username : user.username, password : user.password, app_id : app.id});

            await addWalletAffiliate({user, amount : global.test.depositAmounts[ticker], currency})

            global.test.user = user;
            global.test.user_eth_account = user_eth_account;
        
            });


            it('should be able to ask to withdraw some amount', mochaAsync(async () => {
                let res = await requestUserAffiliateWithdraw({
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

            it('should be able withdraw some Amount', mochaAsync(async () => {
                
                /* Withdraw from Smart-Contract */
                let withdrawTxResponse = await appWithdrawForUser({
                    eth_account : user_eth_account,
                    tokenAmount : global.test.depositAmounts[ticker],
                    currency,
                    platformAddress : appWallet.bank_address
                })

                expect(withdrawTxResponse).to.not.equal(false);
                let res = await getAppUserWithdraws({app : app.id, user : user.id}, app.bearerToken , {id : app.id});
                const { status, message } = res.data;

                res = await finalizeUserWithdraw({
                    app : app.id,
                    user : user.id,
                    withdraw_id : message[0]._id,
                    transactionHash : withdrawTxResponse.transactionHash,
                    currency : currency._id
                }, app.bearerToken , {id : app.id});

                expect(withdrawTxResponse).to.not.equal(false);
                expect(res.data.status).to.equal(200);
            }));
        });
    });
});
