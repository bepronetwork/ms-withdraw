import { Prototype } from "./prototype";
const { ec: EC } = require("elliptic");
import { TRUSTOLOGY_PRIVATE_KEY_BTC, TRUSTOLOGY_WALLETID_BTC } from "../../../config";
const axios = require('axios');
const keyPair = new EC("p256").keyFromPrivate(TRUSTOLOGY_PRIVATE_KEY_BTC);
export class BTC extends Prototype {
    constructor() {
        super();
    }

    async sendTransaction(fromSubWalletId, toAddress, amount) {
        return await this.getSettings().sendBitcoin(fromSubWalletId, toAddress, amount);
    }

    // Return:
    // {
    //     "address": "2NGEyso6wVSoP3CYYRjrkiTivfGJayRSEhj",
    //     "name": "BetBlock BTC wallet",
    //     "id": "dce8be28-a2cb-4956-ab40-91cc3c395759",
    //     "subWalletId": {
    //         "id": "dce8be28-a2cb-4956-ab40-91cc3c395759",
    //         "type": "BTC",
    //         "index": 0
    //     },
    //     "createdAt": "2020-12-04T17:19:35.696Z",
    //     "updatedAt": "2020-12-04T17:19:35.696Z",
    //     "chain": "BITCOIN",
    //     "publicKey": "04ee79a46c48616f25a7964d9d1bc2689638fe9accb4ed0b682dfd40a1a476edcda81bca68c5a5ee63203db41e4143e74b1867631e803f796cc997d60dbaf99cb2",
    //     "trustVaultPublicKeySignature": "dd17bc8646bf038301d192ce212200731d81185ad8cc8271b65c7b2bf6cb6bc8e78a1088bbd3c746bfe3499c4833c1f23e1d4e4702247b72dda6f308be6f28cd",
    //     "__typename": "BlockchainWallet"
    // }
    getAccountIndex(index){
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                query: `query getAccounts {
                  user {
                      firstName
                      lastName
                      email
                      wallets {
                          items {
                              address
                              name
                              id
                            subWalletId {
                              id
                              type
                              index
                            }
                            createdAt
                            updatedAt
                            ... on BlockchainWallet {
                              chain
                              publicKey
                              trustVaultPublicKeySignature
                              __typename
                            }
                          }
                          nextToken
                      }
                  }
              }`,
                variables: {}
              });

            axios(this.axiosConfig(data))
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                const listWallets = response.data.data.user.wallets.items;
                const data = listWallets.find((res)=>{
                    return (res.subWalletId.type == "BTC" && res.subWalletId.index==index);
                });
                resolve(data);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

    createSubWallet(walletId, userId) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                query: 'mutation($type: SubWalletType!, $name: String!, $walletId: String!, ) {\n    createSubWallet(\n        createSubWalletInput: {\n            type: $type,\n            name: $name,\n            walletId: $walletId,\n        }\n    ) {\n        subWalletId\n    }\n}',
                variables: { "type": "BTC", "name": userId, "walletId": walletId }
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

    async autoSendTransaction(toAddress, amount) {
        const sign = async ({ shaSignData }) => {
            const { r, s } = keyPair.sign(shaSignData);
            const hexSignature = r.toString("hex", 64) + s.toString("hex", 64);
            const publicKeySignaturePair = {
              publicKey: Buffer.from(keyPair.getPublic("hex"), "hex"),
              signature: Buffer.from(hexSignature, "hex"),
            };
            console.log("publicKeySignaturePair: ", publicKeySignaturePair);
            return publicKeySignaturePair;
        };
        return await this.getSettings().sendBitcoin(TRUSTOLOGY_WALLETID_BTC, toAddress, amount, "MEDIUM", sign);
    }
}