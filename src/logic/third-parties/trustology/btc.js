import { Prototype } from "./prototype";
const { ec: EC } = require("elliptic");
import { TRUSTOLOGY_PRIVATE_KEY_BTC } from "../../../config";
const axios = require('axios');
const keyPair = new EC("p256").keyFromPrivate(TRUSTOLOGY_PRIVATE_KEY_BTC);
export class BTC extends Prototype {
    constructor() {
        super();
    }

    async sendTransaction(fromSubWalletId, toAddress, amount) {
        return await this.getSettings().sendBitcoin(fromSubWalletId, toAddress, amount);
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

    async autoSendTransaction(fromSubWalletId, toAddress, amount) {
        // call createBitcoinTransaction mutation with the parameters to get a well formed bitcoin transaction
        const result = await this.getSettings().createBitcoinTransaction(fromSubWalletId, toAddress, amount);
        if (!result.signData || !result.requestId) {
            console.error(`Failed to create bitcoin transaction ${JSON.stringify(result)}`);
            throw new Error("Failed to create bitcoin transaction");
        }
        // IMPORTANT: PRODUCTION users are highly recommended to verify the bitcoin transaction (input/outputs are correct and were sent by TrustVault)
        verifyBitcoinTransaction(result.signData, fromSubWalletId, toAddress, amount);

        // IMPORTANT: PRODUCTION users are highly recommended to NOT use the unverifiedDigestData but instead recreate the digests
        const unverifiedSignedDataDigests = result.signData.transaction.inputs.map(
            // If your signing solution requires the pre-image data then use the `input.unverifiedDigestData.signData`.
            (input) => input.unverifiedDigestData.shaSignData,
        );

        // Sign each signRequest with your key pair
        const signRequests = unverifiedSignedDataDigests.map((signedDigest) => {
            // using you private key pair, sign the digest.
            const { r, s } = keyPair.sign(signedDigest);
            // convert the r, s bytes signature to hex format
            const hexSignature = r.toString("hex", 64) + s.toString("hex", 64);
            return {
                publicKeySignaturePairs: [
                    {
                        publicKey: keyPair.getPublic("hex"), // should be in hex string format
                        signature: hexSignature, // should be in hex string format
                    },
                ],
            };
        });

        // submit the addSignature payload and receive back the requestId of your bitcoin transaction request
        const requestId = await apiClient.addSignature({
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