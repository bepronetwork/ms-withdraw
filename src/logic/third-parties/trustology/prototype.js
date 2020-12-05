import { IS_DEVELOPMENT } from "../../../config";
const axios = require('axios');
export class Prototype {
    constructor(){}
    __setSettings(trustVault){
        this.trustVault = trustVault;
        this.url    = IS_DEVELOPMENT ? "https://tapi-sandbox.trustology-test.com/graphql": "" ;
        this.apiKey = "6dYvO5tWl060d79sl7xZm4q5Lp261Mx58dbrXLG4";
    }
    getSettings(){
        return this.trustVault;
    }
    axiosConfig(data){
        return {
            method: 'post',
            url: this.url,
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            },
            data : data
          };
    }

    getAddress(subWalletId) {
        return new Promise((resolve, reject)=>{
            const data = JSON.stringify({
            query: `query getAccounts {
                user {
                    subWallet (subWalletId: "${subWalletId}"){
                        address
                        id
                        name
                        createdAt
                        updatedAt
                        ... on BlockchainSubWallet {
                            chain
                            publicKey
                            trustVaultPublicKeySignature
                            __typename
                        }
                    }
                }
            }`,
            variables: {}
            });

            axios(this.axiosConfig(data))
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                resolve(response.data);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

    getTransaction(requestId) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                query: 'query($requestId: String!) {\n    getRequest(requestId: $requestId) {\n      requestId\n      status\n      type\n      transactionHash\n    }\n  }',
                variables: { "requestId": requestId }
            });

            axios(this.axiosConfig(data))
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                    resolve(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                    reject(error);
                });
        });
    }

}