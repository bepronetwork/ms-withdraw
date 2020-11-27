const CryptoApis = require('cryptoapis.io');
import { CRYPTO_API} from "../../../config";


class CryptoClass {
    constructor() {
        this.cryptoApi = new CryptoApis(CRYPTO_API);
    }

    init() {
        return this.cryptoApi;
    }
}

var CryptoSingleton = new CryptoClass();

export {
    CryptoSingleton
}