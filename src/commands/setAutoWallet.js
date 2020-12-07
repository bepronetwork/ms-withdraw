require('dotenv').config();
const { TrustologySingleton } = require("../logic/third-parties/trustology");
const { ec: EC } = require("elliptic");

 const start = (async(walletId, currency)=>{
    const keyPair = new EC("p256").keyFromPrivate(currency =="eth" ? process.env.TRUSTOLOGY_PRIVATE_KEY_ETH : process.env.TRUSTOLOGY_PRIVATE_KEY_BTC);
     console.log(currency);
     console.log(walletId);
    const subWalletId = (
        await TrustologySingleton
        .method(
            String(currency).toUpperCase()
        )
        .createSubWallet(
            String(walletId).toString(),
            "auto"
        )
    ).data.createSubWallet.subWalletId;

    await TrustologySingleton.method(
        String(currency).toUpperCase()
    ).replacePublicKeyInDefaultSchedule(subWalletId.split("/")[0], keyPair.getPublic("hex"));

});
module.exports = start;