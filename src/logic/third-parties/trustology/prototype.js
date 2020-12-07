import { TRUSTOLOGY_API_KEY, TRUSTOLOGY_URL } from "../../../config";
import { TrustVaultGraphQLClient } from "@trustology/trustvault-nodejs-sdk/api-client";
const axios = require('axios');
export class Prototype {
    constructor(){}
    __setSettings(trustVault){
        this.trustVault = trustVault;
        this.url    = TRUSTOLOGY_URL ;
        this.apiKey = TRUSTOLOGY_API_KEY;
        this.apiClient = new TrustVaultGraphQLClient(this.apiKey, this.url);
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