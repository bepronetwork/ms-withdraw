import { Prototype } from "./prototype";
import { TRUSTOLOGY_PRIVATE_KEY_ETH } from "../../../config";
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

    async autoSendTransaction(to, value, assetSymbol) {
        // call createEthereumTransaction mutation with the parameters to get a well formed ethereum transaction
        const result = await this.apiClient.createEthereumTransaction(keyPair.getPublic("hex"), to, value, assetSymbol);
        if (!result.signData || !result.requestId) {
            console.error(`Failed to create ethereum transaction ${JSON.stringify(result)}`);
            throw new Error("Failed to create ethereum transaction");
        }

        // IMPORTANT: PRODUCTION users are highly recommended to verify the ethereum transaction is what is expected (toAddress, amount, assetSymbol and digests are correct)
        verifyEthereumTransaction(result.signData, keyPair.getPublic("hex"), to, value, assetSymbol);

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