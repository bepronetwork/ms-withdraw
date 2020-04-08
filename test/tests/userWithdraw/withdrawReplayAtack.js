import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { requestUserWithdraw } from "../../methods";
import chai from 'chai';

const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.2,
        token_balance : 5,
    }
}

context('Withdraw Replay Atack', async () => {
    global.test.currencies.forEach( async ticker => {
        
        describe(`${ticker}`, async () => {
            var user, app, user_eth_account, currency, appWallet;
            
            before( async () =>  {

                app = global.test.app;
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


            it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
                let res = requestUserWithdraw({
                    tokenAmount : global.test.depositAmounts[ticker],
                    nonce : 2123423,
                    app : app.id,
                    address : user_eth_account.getAddress(),
                    user : user.id,
                    currency : currency._id
                }, user.bearerToken , {id : user.id});

                let res_replay_atack = await requestUserWithdraw({
                    tokenAmount : global.test.depositAmounts[ticker],
                    nonce : 344563456,
                    app : app.id,
                    address : user_eth_account.getAddress(),
                    user : user.id,
                    currency : currency._id
                }, user.bearerToken , {id : user.id});

                let ret = await Promise.resolve(await res);
                let status_1 = ret.data.status;
                const { status } = res_replay_atack.data;

                // Confirm either one or the other tx got phroibited
                if(status_1 == 200){
                    expect(status_1).to.be.equal(200);
                    expect(status).to.be.equal(14);
                }else{
                    expect(status_1).to.be.equal(14);
                    expect(status).to.be.equal(200);
                }
                expect(detectValidationErrors(res_replay_atack)).to.be.equal(false);

            }));
        });
    });
});
