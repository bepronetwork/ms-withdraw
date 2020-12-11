import { Prototype } from "./prototype";
import { ETHEREUM_ADDRESS_ENV, TRUSTOLOGY_PRIVATE_KEY_ETH } from "../../../config";
const { ec: EC } = require("elliptic");
const axios = require('axios');
const keyPair = new EC("p256").keyFromPrivate(TRUSTOLOGY_PRIVATE_KEY_ETH);

export class ETH extends Prototype {
    constructor() {
        super();
    }

    async sendTransaction(fromAddress, toAddress, amount, asset) {
        try {
            return await this.getSettings().sendEthereum(fromAddress, toAddress, amount, asset);
        } catch (error) {
            console.log(error)
        }
    }
    createSubWallet(walletId, userId) {
        try {
            return new Promise((resolve, reject) => {
                const data = JSON.stringify({
                    query: `mutation($type: SubWalletType!, $name: String!, $walletId: String!, ) {
                        createSubWallet(
                            createSubWalletInput: {
                                type: $type,
                                name: $name,
                                walletId: $walletId,
                            }
                        ) {
                            subWalletId
                        }
                    }`,
                    variables: { "type": "ETH", "name": userId, "walletId": walletId }
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
                            return (res.subWalletId.type == "ETH" && res.subWalletId.index == index);
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

    async autoSendTransaction(toAddress, amount, asset) {
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
            return await this.getSettings().sendEthereum(ETHEREUM_ADDRESS_ENV, toAddress, amount, asset, "MEDIUM", "GBP", sign);
        } catch (error) {
            console.log(error)
        }
    }
}