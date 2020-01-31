import chai from 'chai';
import Mocha from 'mocha';
import { globals } from './Globals';
import { mochaAsync } from './utils/testing';
import Numbers from './logic/services/numbers';
import { createEthAccount } from './utils/env';
import { deploySmartContract, deploySmartContractETH } from './utils/eth';
import { Logger } from './utils/logger';
import { registerAdmin, addCurrencyWalletToApp, registerApp, loginAdmin, getAppAuth, getEcosystemData, updateAppWallet, registerUser, loginUser, updateUserWallet } from './methods';
import { AppRepository } from './db/repos';

const app = require('../src/app');

const expect = chai.expect;
global.mocha = new Mocha({});
global.app = app;
global.test = {};

const initialState = {
    owner : {
        eth_balance : 0.20,
        token_balance : 20,
    }
}


const runTests = async () => {

    mocha
    .addFile('./test/tests/appWithdraw/index.js')
    // .addFile('./test/tests/userWithdraw/index.js')
    // .addFile('./test/tests/affiliateWithdraw/index.js')
    // .addFile('./test/tests/appUserWithdraws/index.js')
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
            let erc20Contract = globals.getERC20Contract(global.erc20TokenAddress)
            let MASTER_TOKEN_AMOUNT =  Numbers.fromDecimals(await erc20Contract.getTokenAmount(globals.masterAccount.getAddress()), 18);
            
            if(MASTER_ETH_AMOUNT < 0.5){
                throw new Error(`ETH is less than 1 for Master \nPlease recharge ETH for Address : ${globals.masterAccount.getAddress()}`)
            }

            if(MASTER_TOKEN_AMOUNT < 50){
                throw new Error(`Tokens are less than 50 for Master \nPlease recharge Tokens for Address : ${globals.masterAccount.getAddress()}`)
            }

            /* Setup Ecosystem */

            /* Create Admin Address and give it ETH */
            let admin_eth_account = await createEthAccount({ethAmount : initialState.owner.eth_balance, tokenAmount : initialState.owner.token_balance});
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
                email : "testt@gmail.com",
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
            app = (await getAppAuth({app : admin.app.id}, admin.app.bearerToken, {id : admin.app.id})).data;
            global.test.app = app;
            /* Add Currency Wallet */

            // Deploy Contract
            let { casino, platformAddress } = (await deploySmartContract({
                tokenAddress : currency.address, 
                decimals : currency.decimals,
                eth_account : admin_eth_account,
                authorizedAddresses : [admin_eth_account.getAddress()],
                croupierAddress : eco.addresses[0]
            }));

            global.test.contract = casino;
            // Run Post with contract info
            postData = {
                app : admin.app.id,
                bank_address : platformAddress,
                currency_id : currency._id
            };

            let res = await addCurrencyWalletToApp(postData, admin.app.bearerToken , {id : admin.app.id});

            // Deploy Contract ETH
            var params = (await deploySmartContractETH({
                eth_account : admin_eth_account,
                croupierAddress : eco.addresses[0]
            }));
            global.test.contractETH = params.casino;

            postData = {
                app : admin.app.id,
                bank_address : params.platformAddress,
                currency_id : currencyETH._id
            };

            res = await addCurrencyWalletToApp(postData, admin.app.bearerToken , {id : admin.app.id});

            /* Deposit for App */
            // Currency 1
            res = await global.test.contract.sendTokensToCasinoContract(2);
            postData = {
                app : admin.app.id,
                amount : 2,
                transactionHash : res.transactionHash,
                currency : currency._id
            };

            res = await updateAppWallet(postData, admin.app.bearerToken, {id : admin.app.id});            
        
            // Currency 2
            res = await global.test.contractETH.sendTokensToCasinoContract(0.01);
            postData = {
                app : admin.app.id,
                amount : 0.01,
                transactionHash : res.transactionHash,
                currency : currencyETH._id
            };
            res = await updateAppWallet(postData, admin.app.bearerToken, {id : admin.app.id});            
            
            /* User Register */
            var postDataUser = {
                username : "sdfg" + parseInt(Math.random()*10000),
                name : "test",
                email : "testt@gmail.com",
                password : 'test123',
                address : '90x',
                app : admin.app.id
            }
            postData = postDataUser;
            let user = await registerUser(postData);
            user = (await loginUser(postData)).data.message;
            global.test.user = user;
            /* User Deposit */
            // Currency 1
            res = await global.test.contract.sendTokensToCasinoContract(1);
            postData = {
                user : user.id,
                app : admin.app.id,
                amount : 1,
                transactionHash : res.transactionHash,
                currency : currency._id
            };

            res = await updateUserWallet(postData, user.bearerToken, {id : user._id});            

            console.log(admin_eth_account.getPrivateKey());
            app = (await getAppAuth({app : admin.app.id}, admin.app.bearerToken, {id : admin.app.id})).data;
            global.test.app = app.message;

            global.test.currencies = [ 'dai', 'eth' ];
            global.test.depositAmounts = {
                'dai' : 0.4, 
                'eth' : 0.002
            }

            global.test.ticker = global.test.currencies[0];

            res = await AppRepository.prototype.setOwnerAddress(admin.app.id, admin_eth_account.getAddress());
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