import { TrustVault } from "@trustology/trustvault-nodejs-sdk";
import { IS_DEVELOPMENT, TRUSTOLOGY_API_KEY } from "../../../config";
import { BTC } from "./btc";
import { ETH } from "./eth";

class Trustology {
    constructor(listCurrencies){
        this.listCurrencies = listCurrencies;
        const trustVault    = new TrustVault(IS_DEVELOPMENT ? { apiKey: TRUSTOLOGY_API_KEY, environment: "sandbox" } : { apiKey: TRUSTOLOGY_API_KEY });
        this.__setSettings(trustVault);
    }
    method(ticker){
        return this.listCurrencies[ticker];
    }
    methods(){
        return this.listCurrencies;
    }
    __setSettings(trustVault){
        for(let item in this.methods()){
            this.methods()[item].__setSettings(trustVault);
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