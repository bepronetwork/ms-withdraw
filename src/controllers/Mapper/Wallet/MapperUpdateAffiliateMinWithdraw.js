import { wallet_update_object } from "../Structures";

let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    updateAffiliateMinWithdraw : (object) => {
        return {
            ...wallet_update_object(object)
        }
    }
}


class UpdateAffiliateMinWithdraw{

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
            UpdateAffiliateMinWithdraw : 'updateAffiliateMinWithdraw'
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

let UpdateAffiliateMinWithdrawSingleton = new UpdateAffiliateMinWithdraw();

export{
    UpdateAffiliateMinWithdrawSingleton
}