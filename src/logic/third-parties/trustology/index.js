import { TrustVault } from "@trustology/trustvault-nodejs-sdk";

class Trustology{
    constructor(listCurrencies){
        this.listCurrencies = listCurrencies;
        const trustVault    = new TrustVault({ apiKey: "<TRUST_VAULT_API_KEY>", environment: "sandbox" });
        this.__setSettings(trustVault);
    }
    method(ticker){
        return this.listCurrencies[ticker];
    }
    methods(){
        return this.listCurrencies;
    }
    __setSettings(trustVault){
        for(let item of this.methods()){
            item.__setSettings(trustVault);
        }
    }
}

const TrustologySingleton = new Trustology({
    "BTC": (new BTC()),
    "ETH": (new ETH())
});

export {
    TrustologySingleton
}