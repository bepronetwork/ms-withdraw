import { mochaAsync, detectValidationErrors } from "../../utils/testing";
import { Logger } from "../../utils/logger";
import { createEthAccount, registerUser, loginUser, addWalletAffiliate } from "../../utils/env";
import { requestUserAffiliateWithdraw } from "../../methods";
import chai from 'chai';
import Numbers from "../../logic/services/numbers";
const delay = require('delay');

const expect = chai.expect;

const initialState = {
    user : {
        eth_balance : 0.12,
        token_balance : 5,
    }
}

context('Withdraw Replay Atack', async () => {
    var user, app, user_eth_account, contract, casino;
    
    before( async () =>  {

        app = global.test.app;
        contract = global.test.contract;
        casino = contract.casino;

        /* Create User Address and give it ETH */
        user_eth_account = await createEthAccount({ethAmount : initialState.user.eth_balance, tokenAmount : initialState.user.token_balance});

        /* Create User on Database */
        user = await registerUser({address : user_eth_account.getAddress(), app_id : app.id});
        user = await loginUser({username : user.username, password : user.password, app_id : app.id});
        /* Add Amount for User on Database */
        await addWalletAffiliate({user, amount: 3});
    });


    it('should be able to withdraw only once, and phoibit second', mochaAsync(async () => {
        let res = requestUserAffiliateWithdraw({
            tokenAmount : 3,
            nonce : 2123423,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});

        let res_replay_atack = await requestUserAffiliateWithdraw({
            tokenAmount : 3,
            nonce : 344563456,
            app : app.id,
            address : user_eth_account.getAddress(),
            user : user.id
        }, user.bearerToken , {id : user.id});
        let ret = await Promise.resolve(await res);
        let status_1 = ret.data.status;
        const { status } = res_replay_atack.data;
        let dexWithdrawalAmount = await casino.getApprovedWithdrawAmount({address : user_eth_account.getAddress()});

        // Confirm either one or the other tx got phroibited
        if(status_1 == 200){
            expect(status_1).to.be.equal(200);
            expect(status).to.be.equal(14);
        }else{
            expect(status_1).to.be.equal(14);
            expect(status).to.be.equal(200);
        }
        expect(Numbers.toFloat(dexWithdrawalAmount)).to.be.equal(3)
        expect(detectValidationErrors(res_replay_atack)).to.be.equal(false);

    }));
});
