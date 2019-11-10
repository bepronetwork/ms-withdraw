import request from 'supertest';
import _ from 'lodash';

export async function requestUserWithdraw({tokenAmount, nonce, app, user, address}, bearerToken, payload){
    return request(global.app)
    .post('/api/users/requestWithdraw')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send({
        tokenAmount, nonce, app, user, address
    })
    .then(res => {return res.body})

};

export async function requestAppWithdraw(params, bearerToken, payload){
    return request(global.app)
    .post('/api/app/requestWithdraw')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => {return res.body})
};

export async function requestUserAffiliateWithdraw(params, bearerToken, payload){
    return request(global.app)
    .post('/api/users/affiliate/requestWithdraw')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => {return res.body})
};

export async function finalizeUserWithdraw(params, bearerToken, payload){
    return request(global.app)
    .post('/api/users/finalizeWithdraw')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => {return res.body})
};

export async function getAppUserWithdraws(params, bearerToken, payload){
    return request(global.app)
    .post('/api/app/users/withdraws')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => {return res.body})
};

function getPayloadString(payloadObject){
    if(!payloadObject){return null}
    return JSON.stringify({ id : payloadObject.id })
}

