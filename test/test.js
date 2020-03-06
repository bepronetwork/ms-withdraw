import chai from 'chai';
import Mocha from 'mocha';
import { globals } from './Globals';
import { mochaAsync } from './utils/testing';
import Numbers from './logic/services/numbers';
import { createEthAccount } from './utils/env';
import { Logger } from './utils/logger';
import { registerAdmin, addCurrencyWalletToApp, registerApp, loginAdmin, getAppAuth, getEcosystemData, updateAppWallet, registerUser, loginUser, updateUserWallet } from './methods';
import { AppRepository } from './db/repos';
import delay from 'delay';

const app = require('../src/app');

const expect = chai.expect;
global.mocha = new Mocha({});
global.app = app;
global.test = {};

const initialState = {
    eth : {
        balance : 0.20,
        deposit : 0.05
    }
}


const runTests = async () => {

    mocha
    .addFile('./test/tests/appWithdraw/index.js')
    .addFile('./test/tests/userWithdraw/index.js')
    .addFile('./test/tests/affiliateWithdraw/index.js')
    .addFile('./test/tests/appUserWithdraws/index.js')
    .timeout(10*60*60*1000)
    .run()
    .on('fail', function(test, err) {
        console.log(err);
        console.log('Test fail');
        process.exit(1);
    })
    .on('end', function() {
        console.log('All done');
        process.exit(0)
    });
};

const test = async () => {
    describe('BetProtocol - Withdraw Micro Service', async () => {
        before(async () => {
            /* Connect with Database */
            await globals.connect();
            var app;
                    
            let MASTER_ETH_AMOUNT = await globals.masterAccount.getBalance();
            
            if(MASTER_ETH_AMOUNT < 0.5){
                throw new Error(`ETH is less than 1 for Master \nPlease recharge ETH for Address : ${globals.masterAccount.getAddress()}`)
            }

            /* Setup Ecosystem */

            /* Create Admin Address and give it ETH */
            let admin_eth_account = await createEthAccount({ethAmount : initialState.eth.balance});
            global.test.admin_eth_account = admin_eth_account;

            Logger.info("Account Admin ", admin_eth_account.getAddress());

            let eco = (await getEcosystemData()).data.message;

            let currency = eco.currencies.find(c => new String(c.ticker).toLowerCase() == 'dai');
            let currencyETH = eco.currencies.find(c => new String(c.ticker).toLowerCase() == 'eth');


            var postData;
            /* Create Admin */
            var postDataAdmin = {
                username : "admin1" + parseInt(Math.random()*10000),
                name : "test",
                email : `testt${parseInt(Math.random()*10000)}@gmail.com`,
                password : 'test123'
            }
         
            postData = postDataAdmin;
            let admin = await registerAdmin(postData);
            admin = (await loginAdmin(postData)).data.message;
            global.test.admin = admin;
            /* Create App */
            postData = {
                name : "companuy" + parseInt(Math.random()*10000),
                description : "sresy4",
                metadataJSON : JSON.stringify({}),
                admin_id : admin.id,
                marketType : 0
            }


            app = (await registerApp(postData)).data.message;
            admin = (await loginAdmin(postDataAdmin)).data.message;

            app = (await getAppAuth({app : admin.app.id, admin: admin.id}, admin.security.bearerToken, {id : admin.id})).data;
            global.test.app = app;
            /* Add Currency Wallet */

            // Run Post with contract info
            postData = {
                app : admin.app.id,
                passphrase : 'test',
                currency_id : currencyETH._id
            };

            await addCurrencyWalletToApp({...postData, admin: admin.id}, admin.security.bearerToken , {id : admin.id});  
            /* User Register */
            var postDataUser = {
                username : "sdfg" + parseInt(Math.random()*10000),
                name : "test",
                email : `testt${parseInt(Math.random()*10000)}@gmail.com`,
                password : 'test123',
                address : '90x',
                app : admin.app.id
            }

            

            postData = postDataUser;
            let user = await registerUser(postData);
            user = (await loginUser(postData)).data.message;
            global.test.user = user;

            app = (await getAppAuth({app : admin.app.id, admin: admin.id}, admin.security.bearerToken, {id : admin.id})).data;
           
            global.test.app = app.message;

            global.test.currencies = [ 'eth' ];
            global.test.depositAmounts = {
                'eth' : 0.01
            }
            global.test.initialState = initialState;

            // App Deposit
            await admin_eth_account.sendEther(0.05, app.message.wallet[0].bank_address);
            // Wait for Deposit to Settle and funds to be there
            await delay(30*1000);
            global.test.ticker = global.test.currencies[0];

            await AppRepository.prototype.setOwnerAddress(admin.app.id, admin_eth_account.getAddress());
            expect(true).to.equal(true);      
        })
        it('Unit Testing', async () => {
            /* Start Testing */
            await runTests();
        });
    });
}

/* Run Tests */
(process.env.ENV == 'production') ?  process.exit(0) : test();