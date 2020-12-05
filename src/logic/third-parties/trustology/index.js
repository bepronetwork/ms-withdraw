import { TrustVault } from "@trustology/trustvault-nodejs-sdk";
import { BTC } from "./btc";
import { ETH } from "./eth";

class Trustology {
    constructor(listCurrencies){
        this.listCurrencies = listCurrencies;
        const trustVault    = new TrustVault({ apiKey: "6dYvO5tWl060d79sl7xZm4q5Lp261Mx58dbrXLG4", environment: "sandbox" });
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