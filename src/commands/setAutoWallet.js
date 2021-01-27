require('dotenv').config();
const { TrustologySingleton } = require("../logic/third-parties/trustology");
const { ec: EC } = require("elliptic");

 const start = (async(walletId, currency)=>{

    const keyPair = new EC("p256").keyFromPrivate(currency =="eth" ? process.env.TRUSTOLOGY_PRIVATE_KEY_ETH : process.env.TRUSTOLOGY_PRIVATE_KEY_BTC);

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
    const requestId = await TrustologySingleton.method(
        String(currency).toUpperCase()
    ).replacePublicKeyInDefaultSchedule(walletId, keyPair.getPublic("hex"), sign);
    console.log(requestId);
});
module.exports = start;