context('User Testing', async () => {
    require('./withdrawReplayAtack');
    require('./withdrawNoUser');
    require('./withdrawNoApp');
    require('./withdrawNoCredentials');
    require('./withdraw0');
    require('./withdrawNoFunds');
    require('./withdrawSomeAmount');
    require('./withdrawMinError');
    require('./withdrawAllAmount');
});