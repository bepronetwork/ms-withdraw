const axios = require('axios');
const qs = require('qs');
const data = qs.stringify({
'grant_type': 'client_credentials'
});
var base64 = require('base-64');

class Mati {
    getBearerToken(clientID, client_secret) {
        return new Promise((resolve, reject)=>{
            const config = {
            method: 'post',
            url: 'https://api.getmati.com/oauth',
            headers: {
                'Authorization': `Basic ${base64.encode(clientID+':'+client_secret)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
            };
            axios(config)
            .then(function (response) {
            resolve(response.data)
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

    getData(url, token) {
        return new Promise((resolve, reject)=>{
            const config = {
                method: 'get',
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Authorization': `Bearer ${token}`
                }
            };
            axios(config)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }
}
const MatiKYCSingleton = new Mati();
export { MatiKYCSingleton };