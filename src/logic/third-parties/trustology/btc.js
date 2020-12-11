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
        try {
            console.log("amount:: ",amount)
            return await this.getSettings().sendBitcoin(fromSubWalletId, toAddress, new String(amount));
        } catch (error) {
            console.log(error)
        }
    }

    getAccountIndex(index) {
        try {
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
                        const data = listWallets.find((res) => {
                            return (res.subWalletId.type == "BTC" && res.subWalletId.index == index);
                        });
                        resolve(data);
                    })
                    .catch(function (error) {
                        console.log(error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.log(error)
        }
    }

    createSubWallet(walletId, userId) {
        try {
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
        } catch (error) {
            console.log(error)
        }
    }

    async autoSendTransaction(toAddress, amount) {
        try {
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
            return await this.getSettings().sendBitcoin(TRUSTOLOGY_WALLETID_BTC, toAddress, new String(amount), "MEDIUM", sign);
        } catch (error) {
            console.log(error)
        }
    }
}