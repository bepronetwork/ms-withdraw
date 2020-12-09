let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    updateWallet: (object) => {
        return {
            "wallet": !object.wallet ? {} : {
                "playBalance": object.wallet.playBalance,
                "max_deposit": object.wallet.max_deposit,
                "max_withdraw": object.wallet.max_withdraw,
                "min_withdraw": object.wallet.min_withdraw,
                "affiliate_min_withdraw": object.wallet.affiliate_min_withdraw,
                "depositAddresses": !object.wallet.depositAddresses ? [] : object.wallet.depositAddresses.map(deposit_address_id => deposit_address_id),
                "link_url": object.wallet.link_url,
                "_id": object.wallet._id,
                "currency": !object.wallet.currency ? {} : {
                    "_id": object.wallet.currency._id,
                    "image": object.wallet.currency.image,
                    "ticker": object.wallet.currency.ticker,
                    "decimals": object.wallet.currency.decimals,
                    "name": object.wallet.currency.name,
                    "address": object.wallet.currency.address,
                },
                "bitgo_id": object.wallet.bitgo_id,
                "bank_address": object.wallet.bank_address
            },
            "creationDate": object.creationDate,
            "transactionHash": object.transactionHash,
            "from": object.from,
            "amount": object.amount,
            "wasAlreadyAdded": object.wasAlreadyAdded,
            "isValid": object.isValid,
        }
    },
}


class MapperUpdateWallet {

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
            UpdateWallet: 'updateWallet'
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

let MapperUpdateWalletSingleton = new MapperUpdateWallet();

export {
    MapperUpdateWalletSingleton
}