
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    getUsersWithdraws: (object) => {
        return object.map(object => {
            return ({
                "_id": object._id,
                "app": object.app,
                "user": object.user,
                "creation_timestamp": object.creation_timestamp,
                "address": object.address,
                "currency": object.currency,
                "amount": object.amount,
                "nonce": object.nonce,
                "link_url": object.link_url,
                "isAffiliate": object.isAffiliate,
                "status": object.status,
                "done": object.done,
                "confirmed": object.confirmed,
                "maxConfirmations": object.maxConfirmations,
                "confirmations": object.confirmations,
                "last_update_timestamp": object.last_update_timestamp,
                "logId": object.logId,
                "transactionHash": object.transactionHash,
                "__v": object.__v
            })
        })
    }
}


class GetUsersWithdraws {

    constructor() {
        self = {
            outputs: outputs
        }

        /**
         * @object KEYS for Output Mapping
         * @key Input of Output Function <-> Output for Extern of the API
         * @value Output of Function in Outputs
         */

        this.KEYS = {
            GetUsersWithdraws: 'getUsersWithdraws'
        }
    }

    output(key, value) {
        try {
            return self.outputs[this.KEYS[key]](value);
        } catch (err) {
            throw err;
        }
    }
}

let GetUsersWithdrawsSingleton = new GetUsersWithdraws();

export {
    GetUsersWithdrawsSingleton
}