context('User Testing', async () => {
    require('./withdrawSomeAmount');
    require('./withdrawReplayAtack');
    require('./withdrawNoUser');
    require('./withdrawNoApp');
    require('./withdrawNoCredentials');
    require('./withdraw0');
    require('./autoWithdraw');
    require('./withdrawMax');
    require('./withdrawEmailNoConfirmed');
    require('./withdrawNoFunds');
    //require('./withdrawMinError');
    require('./withdrawAllAmount');
});