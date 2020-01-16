import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { appDepositToContract, appWithdrawFromContract } from "../../utils/eth";
import { requestAppWithdraw, finalizeAppWithdraw, getAppAuth } from "../../methods";
import chai from 'chai';
import { appConfirmDeposit, loginAdmin, appWalletInfo } from "../../utils/env";
const expect = chai.expect;

context('Withdraw All Amount', async () => {

    global.test.currencies.forEach( async ticker => {
        describe(`${ticker}`, async () => {

            var app, contract, admin, admin_eth_account, app_withdraw, appWallet, currency, contract;
            
            before( async () =>  {
                app = global.test.app;
                contract = global.test.contract;
            
                appWallet = app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase());
                currency = appWallet.currency;
    
                switch(new String(currency.ticker).toLowerCase()){
                    case 'dai' : {
                        contract = global.test.contract;
                        break;
                    };
                    case 'eth' : {
                        contract = global.test.contractETH;
                        break;
                    };
                }
                
                admin_eth_account = global.test.admin_eth_account;
                admin = global.test.admin;
                /* Add Amount for User on Database */
                let app_deposit_transaction = await appDepositToContract({tokenAmount :  global.test.depositAmounts[ticker], currency, platformAddress : appWallet.bank_address});
    
                await appConfirmDeposit({   
                    app : app,
                    transactionHash : app_deposit_transaction.transactionHash,
                    amount :  global.test.depositAmounts[ticker],
                    currency
                })
    
            });
    
    
            it('should be able to ask to withdraw all amount', mochaAsync(async () => {
                app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
                let previousBalance =  app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase()).playBalance;
    
                let dexWithdrawalAmount = await contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
                // Verify if initial states are met
                expect(parseFloat(dexWithdrawalAmount)).to.be.equal(0);
    
                app_withdraw = await requestAppWithdraw({
                    tokenAmount :  global.test.depositAmounts[ticker],
                    nonce : 3456365756,
                    app : app.id,
                    address : admin_eth_account.getAddress(),
                    currency : currency._id
                }, app.bearerToken , {id : app.id});
                const { status } = app_withdraw.data;
    
                app = (await getAppAuth({app : app.id}, app.bearerToken, {id : app.id})).data.message;
                let balance =  app.wallet.find( w => new String(w.currency.ticker).toLowerCase() == new String(ticker).toLowerCase()).playBalance;
    
                dexWithdrawalAmount = await contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
                // Verify if middle states are met
                expect(detectValidationErrors(app_withdraw)).to.be.equal(false);
                expect(status).to.be.equal(200);
                expect(parseFloat(dexWithdrawalAmount)).to.be.equal(global.test.depositAmounts[ticker]);
                expect(parseFloat(balance)).to.be.equal(previousBalance-global.test.depositAmounts[ticker]);
    
            }));
    
            it('should be able withdraw all Amount', mochaAsync(async () => {
                /* Withdraw from Smart-Contract */
                let withdrawTxResponse = await appWithdrawFromContract({
                    currency,
                    platformAddress : appWallet.bank_address,
                    account : admin_eth_account,
                    address : admin_eth_account.getAddress(),
                    tokenAmount :  global.test.depositAmounts[ticker],
                });
    
                let dexWithdrawalAmount = await contract.getApprovedWithdrawAmount({address : admin_eth_account.getAddress()});
    
                expect(parseFloat(dexWithdrawalAmount)).to.be.equal(0);
                expect(withdrawTxResponse).to.not.equal(false);
                
                let res = await finalizeAppWithdraw({
                    app : app.id,
                    withdraw_id : app_withdraw.data.message._id,
                    transactionHash : withdrawTxResponse.transactionHash,
                    currency : currency._id
                }, app.bearerToken , {id : app.id});
    
                expect(res.data.status).to.equal(200);
                expect(res.data.message.transactionHash).to.equal(withdrawTxResponse.transactionHash);
    
            }));
        });
    });
});
