import request from 'supertest';
import _ from 'lodash';
import axios from 'axios';
import { MS_MASTER_URL } from '../src/config';

export async function requestUserWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/users/requestWithdraw')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))

};

export async function requestAppWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/app/requestWithdraw')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function requestUserAffiliateWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/users/affiliate/requestWithdraw')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};
export async function addCurrencyWalletToApp(params, bearerToken, payload) {
    return request(global.server)
    .post('/api/app/wallet/currency/add')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => detectServerError(res))
    
};
export async function finalizeUserWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/users/finalizeWithdraw')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function finalizeAppWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/app/finalizeWithdraw')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function pingPost(params, bearerToken, payload){
    return request(global.app)
    .post('/api/status/post')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => detectServerError(res))
};
export async function pingPostMiddleware(params, bearerToken, payload){
    return request(global.app)
    .post('/api/status/post')
    .set("authorization", "Bearer " + bearerToken)
    .set("payload", getPayloadString(payload))
    .send(params)
    .then(res => res)
};

export async function getAppUserWithdraws(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/app/users/withdraws')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function setAppMaxWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/withdraw/max/set')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function setAppMinWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/withdraw/min/set')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

export async function setAffiliateMinWithdraw(params, bearerToken, payload) {
    return request(global.app)
        .post('/api/affiliate/withdraw/min/set')
        .set("authorization", "Bearer " + bearerToken)
        .set("payload", getPayloadString(payload))
        .send(params)
        .then(res => detectServerError(res))
};

/* OTHER API INFO */
export async function addCurrencyWalletToApp(params, bearerToken, payload) {
    return await axios.post(`${MS_MASTER_URL}/api/app/wallet/currency/add`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })
}

export async function editKycNeeded(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/user/kyc_needed/edit`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function confirmEmail(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/users/email/confirm`, params)).data;
}

export async function getEcosystemData() {
    return (await axios.get(`${MS_MASTER_URL}/api/ecosystem/all`)).data
}

export async function registerAdmin(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/admins/register`, params)).data
}

export async function registerUser(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/users/register`, params)).data
}

export async function loginAdmin(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/admins/login`, params)).data;
}

export async function loginUser(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/users/login`, params)).data;
}

export async function authAdmin(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/admins/auth`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function deployApp(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/deploy`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function authUser(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/users/auth`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function registerApp(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/create`, params)).data;
}

export async function getApp(params) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/get`, params)).data;
}


export async function getAppAuth(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/get/auth`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function getUser(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/user/get`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function updateAppWallet(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/updateWallet`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function updateUserWallet(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/users/updateWallet`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function addAutowithdraw(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/autoWithdraw/add`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function editAutowithdraw(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/autoWithdraw/editAutoWithdraw`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function addTxFee(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/txFee/add`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

export async function editTxFee(params, bearerToken, payload) {
    return (await axios.post(`${MS_MASTER_URL}/api/app/txFee/editTxFee`, params, {
        headers: {
            "authorization": `Bearer ${bearerToken}`,
            "payload": getPayloadString(payload)
        }
    })).data;
}

function getPayloadString(payloadObject) {
    if (!payloadObject) { return null }
    return JSON.stringify({ id: payloadObject.id })
}



function detectServerError(res) {
    if (res.body && !_.isEmpty(res.body)) {
        // Nothing
    } else {
        //Error on Server that does not show on testing since mocha hides server logs sometimes 
        console.log(res.error);
    }

    return res.body;
}