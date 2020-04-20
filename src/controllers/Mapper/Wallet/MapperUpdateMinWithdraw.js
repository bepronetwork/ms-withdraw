import { wallet_update_object } from "../Structures";

let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    updateMinWithdraw : (object) => {
        return {
            ...wallet_update_object(object)
        }
    }
}


class UpdateMinWithdraw{

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
            UpdateMinWithdraw : 'updateMinWithdraw'
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

let UpdateMinWithdrawSingleton = new UpdateMinWithdraw();

export{
    UpdateMinWithdrawSingleton
}