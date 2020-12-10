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
        return await this.getSettings().sendEthereum(fromAddress, toAddress, amount, asset);
    }
    createSubWallet(walletId, userId) {
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
                    return (res.subWalletId.type == "ETH" && res.subWalletId.index==index);
                });
                resolve(data);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

    async autoSendTransaction(to, value, assetSymbol) {
        // call createEthereumTransaction mutation with the parameters to get a well formed ethereum transaction
        const result = await this.apiClient.createEthereumTransaction(ETHEREUM_ADDRESS_ENV, to, value, assetSymbol);
        if (!result.signData || !result.requestId) {
            console.error(`Failed to create ethereum transaction ${JSON.stringify(result)}`);
            throw new Error("Failed to create ethereum transaction");
        }

        // IMPORTANT: PRODUCTION users are highly recommended to verify the ethereum transaction is what is expected (toAddress, amount, assetSymbol and digests are correct)
        verifyEthereumTransaction(result.signData, ETHEREUM_ADDRESS_ENV, to, value, assetSymbol);

        // IMPORTANT: PRODUCTION users are highly recommended to NOT use the unverifiedDigestData but instead recreate the digests
        // If your signing solution requires the pre-image data then use the `result.signData.unverifiedDigestData.signData`.
        const signDigest = result.signData.unverifiedDigestData.shaSignData;
        // using you private key pair, sign the digest.
        const { r, s } = keyPair.sign(signDigest);

        // create the signRequests payload
        const signRequests = [
            {
                publicKeySignaturePairs: [
                    {
                        publicKey: keyPair.getPublic("hex"), // should be in hex string format
                        signature: r.toString("hex", 64) + s.toString("hex", 64), // convert the r, s bytes signature to hex format
                    },
                ],
            },
        ];

        // submit the addSignature payload and receive back the requestId of your ethereum transaction request
        const requestId = await this.apiClient.addSignature({
            requestId: result.requestId,
            signRequests,
        });

        // Check that your transaction was successfully submitted to the network
        const expectedStatus = "SUBMITTED";
        const status = await pollRequestStatus(requestId, expectedStatus);
        console.info(`request (${requestId}) - status: ${status}`);

        return requestId;
    }
}