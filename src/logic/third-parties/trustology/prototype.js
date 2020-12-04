import { IS_DEVELOPMENT } from "../../../config"
export class Prototype {
    constructor(){}
    __setSettings(trustVault){
        this.trustVault = trustVault;
        this.url        = IS_DEVELOPMENT ? "https://tapi-sandbox.trustology-test.com/graphql": "" ;
        this.apiKey     = "";
    }
    getSettings(){
        return this.trustVault;
    }
    axiosConfig(data){
        return {
            method: 'post',
            url: this.url,
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json'
            },
            data : data
          };
    }
}