export class Prototype {
    constructor(){}
    __setSettings(trustVault){
        this.trustVault = trustVault;
    }
    getSettings(){
        return this.trustVault;
    }
}