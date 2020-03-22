
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    finalizeWithdrawUser : (object) => {
        return {
            "tx": object.tx
        }
    }
}


class FinalizeWithdrawUser{

    constructor(){
        self = {
            outputs : outputs
        }

        /**
         * @object KEYS for Output Mapping
         * @key Input of Output Function <-> Output for Extern of the API
         * @value Output of Function in Outputs
         */

        this.KEYS = {
            FinalizeWithdrawUser : 'finalizeWithdrawUser'
        }
    }

    output(key, value){
        try{
            return self.outputs[this.KEYS[key]](value);
        }catch(err){
            throw err;
        }
    }
}

let FinalizeWithdrawUserSingleton = new FinalizeWithdrawUser();

export{
    FinalizeWithdrawUserSingleton
}