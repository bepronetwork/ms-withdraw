import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { createEthAccount, registerUser, loginUser, depositWallet } from "../../utils/env";
import { requestUserWithdraw, getAppUserWithdraws, finalizeUserWithdraw, cancelUserWithdraw } from "../../methods";
import chai from 'chai';
const expect = chai.expect;
import { WalletsRepository } from "../../../src/db/repos";

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}
context('Withdraw Some Amount', async () => {

    global.test.currencies.forEach( async ticker => {
        describe(`${ticker}`, async () => {
            var user, admin, app, user_eth_account, contract, appWallet, currency, userWallet;
            before( async () =>  {
                admin = global.test.admin;
                app = global.test.app;
                contract = global.test.contract;
                appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
                currency = appWallet.currency;

                /* Create User Address and give it ETH */
                user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

                /* Create User on Database */
                user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
                user = await loginUser({username : user.username, password : user.password, app_id : app.id});
                userWallet = user.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());

                /* Add Amount for User on Database */
                await depositWallet({wallet_id : userWallet._id, amount : global.test.depositAmounts[ticker]});
            
                global.test.user = user;
                global.test.user_eth_account = user_eth_account;
            
            });

            it('shouldnt be able to ask to withdraw some amount - Has Bonus Yet', mochaAsync(async () => {
                await WalletsRepository.prototype.updateBonusAndAmount({ wallet_id: userWallet._id, playBalance: 0.001, bonusAmount: 0.001 });
                let res = await requestUserWithdraw({
                    tokenAmount : 0.001,
                    nonce : 34563657553,
                    app : app.id,
                    address : user_eth_account.getAddress(),
                    user : user.id,
                    currency : currency._id
                }, user.bearerToken , {id : user.id});

                expect(detectValidationErrors(res)).to.be.equal(false);
                const { status } = res.data;
                expect(status).to.be.equal(50)
            }));


            it('should be able to ask to withdraw some amount', mochaAsync(async () => {
                await WalletsRepository.prototype.updateBonusAndAmount({ wallet_id: userWallet._id, playBalance: 0.1, bonusAmount: 0 });
                let res = await requestUserWithdraw({
                    tokenAmount : global.test.depositAmounts[ticker]/2,
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

            it('should cancel withdraw OK', mochaAsync(async () => {

                let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
                const { message } = withdraws_res.data;
                let res = await cancelUserWithdraw({
                    app : app.id,
                    admin : admin.id,
                    user : user.id,
                    withdraw_id : message[0]._id,
                    currency : currency._id,
                    note     : "test"
                }, admin.bearerToken , {id : admin.id});

                expect(res.data.status).to.equal(200);
            }));

            it('shouldn`t cancel withdraw', mochaAsync(async () => {

                let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
                const { message } = withdraws_res.data;
                let res = await cancelUserWithdraw({
                    app : app.id,
                    admin : admin.id,
                    user : user.id,
                    withdraw_id : message[0]._id,
                    currency : currency._id,
                    note     : "test"
                }, admin.bearerToken , {id : admin.id});

                expect(res.data.status).to.equal(19);
            }));

            it('shouldn`t finalize withdraw', mochaAsync(async () => {

                let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
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

            it('should be able to ask to withdraw some amount', mochaAsync(async () => {
                let res = await requestUserWithdraw({
                    tokenAmount : global.test.depositAmounts[ticker]/2,
                    nonce : 3456365770,
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

                let withdraws_res = await getAppUserWithdraws({app : app.id, user : user.id, admin: admin.id}, admin.bearerToken , {id : admin.id});
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
    });
});
