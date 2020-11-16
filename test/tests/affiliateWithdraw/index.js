context('Affiliate Testing', async () => {
    require('./withdrawKyc');
    require('./withdrawReplayAtack');
    require('./withdrawMin');
    require('./withdrawNoUser');
    require('./withdrawNoApp');
    require('./withdrawNoCredentials');
    require('./withdraw0');             
    require('./withdrawNoFunds');
    require('./withdrawSomeAmount');
    //require('./withdrawMinError');
    require('./withdrawAllAmount');
});