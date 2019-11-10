import chai from 'chai';
import Mocha from 'mocha';
import { globals } from './Globals';
import { mochaAsync } from './utils/testing';
import Numbers from './logic/services/numbers';
import { addBlockchainInformation, registerApp, registerAdmin, createEthAccount } from './utils/env';
import { deploySmartContract } from './utils/eth';
import { Logger } from './utils/logger';

const app = require('../src/app');

const expect = chai.expect;
global.mocha = new Mocha({});
global.app = app;
global.test = {};

const initialState = {
    owner : {
        eth_balance : 0.20,
        token_balance : 15,
    }
}


const runTests = async () => {

    mocha
    .addFile('./test/tests/affiliateWithdraw/index.js')
    .addFile('./test/tests/appWithdraw/index.js')
    .addFile('./test/tests/userWithdraw/index.js')
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
            Logger.info("Account Admin ", admin_eth_account.getAddress());
            /* Create Admin on Database */
            let admin = await registerAdmin();
            global.test.admin = admin;
            /* Create App on Database */
            app = await registerApp({admin_id : admin._id})
            global.test.app = app;
            global.test.admin_eth_account = admin_eth_account;
            console.log(admin);
            console.log(admin_eth_account.getPrivateKey())
            /* Deploy Smart-Contract & Register Smart-Contract Data */
            let contract = await deploySmartContract({eth_account : admin_eth_account});
            global.test.contract = contract;

            let res = await addBlockchainInformation({
                app_id                      : app.id,
                address                     : admin_eth_account.getAddress(),
                platformAddress             : contract.platformAddress,
                platformBlockchain          : contract.platformBlockchain
            })

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