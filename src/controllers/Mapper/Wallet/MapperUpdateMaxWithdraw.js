
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    updateMaxWithdraw : (object) => {
        return {
            "id": object._id,
            "depositAddresses": object.depositAddresses ? object.depositAddresses.map(deposit_address => {
                return ({
                    "_id": deposit_address._id,
                    "currency": deposit_address.currency,
                    "user": deposit_address.user,
                    "bitgo_id": deposit_address.bitgo_id,
                })
            }) : object.depositAddresses,
            "currency": object.currency,
            "bitgo_id": object.bitgo_id,
            "hashed_passphrase": object.hashed_passphrase,
            "link_url": object.link_url,
            "max_withdraw": object.max_withdraw,
            "max_deposit": object.max_deposit,
            "bank_address": object.bank_address,
            "playBalance": object.playBalance,
            "__v": object.__v
        }
    }
}


class UpdateMaxWithdraw{

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
            UpdateMaxWithdraw : 'updateMaxWithdraw'
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

let UpdateMaxWithdrawSingleton = new UpdateMaxWithdraw();

export{
    UpdateMaxWithdrawSingleton
}