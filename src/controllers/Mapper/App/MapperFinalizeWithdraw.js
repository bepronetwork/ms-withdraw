
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    finalizeWithdrawApp : (object) => {
        return {
            "tx": object.tx
        }
    }
}


class FinalizeWithdrawApp{

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
            FinalizeWithdrawApp : 'finalizeWithdrawApp'
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

let FinalizeWithdrawAppSingleton = new FinalizeWithdrawApp();

export{
    FinalizeWithdrawAppSingleton
}