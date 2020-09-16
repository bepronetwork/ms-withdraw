context('User Testing', async () => {
    require('./withdrawKyc');
    require('./withdrawReplayAtack');
    require('./withdrawNoUser');
    require('./withdrawNoApp');
    require('./withdrawNoCredentials');
    require('./withdraw0');
    require('./txFeeWithdraw');
    require('./autoWithdraw');
    require('./withdrawMax');
    require('./withdrawEmailNoConfirmed');
    require('./withdrawNoFunds');
    require('./withdrawSomeAmount');
    //require('./withdrawMinError');
    require('./withdrawAllAmount');
});