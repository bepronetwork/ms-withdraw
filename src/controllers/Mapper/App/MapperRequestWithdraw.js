
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    requestWithdrawApp: (object) => {
        return {
            "__v": object.__v,
            "app": {
                "_id": object.app._id,
                "currencies": object.app.currencies ? object.app.currencies.map(currencies => {
                    return ({
                        "_id": currencies
                    })
                }) : object.app.currencies,
                "typography": object.app.typography ? object.app.typography.map(typography => {
                    return ({
                        "_id": typography
                    })
                }) : object.app.typography,
                "name": object.app.name,
                "affiliateSetup": {
                    "_id": object.app.affiliateSetup._id,
                    "customAffiliateStructures": object.app.affiliateSetup.customAffiliateStructures ? object.app.affiliateSetup.customAffiliateStructures.map(customAffiliateStructures => {
                        return ({
                            "_id": customAffiliateStructures
                        })
                    }) : object.app.affiliateSetup.customAffiliateStructures,
                    "affiliateStructures": object.app.affiliateSetup.affiliateStructures ? object.app.affiliateSetup.affiliateStructures.map(affiliateStructures => {
                        return ({
                            "_id": affiliateStructures._id,
                            "level": affiliateStructures.level,
                            "percentageOnLoss": affiliateStructures.percentageOnLoss,
                            "isActive": affiliateStructures.isActive,
                        })
                    }) : object.app.affiliateSetup.affiliateStructures,
                    "isActive": object.app.affiliateSetup.isActive
                },
                "customization": object.app.customization,
                "integrations": {
                    "_id": object.app.integrations._id,
                    "chat": {
                        "_id": object.app.integrations.chat._id,
                        "privateKey": object.app.integrations.chat.privateKey,
                        "publicKey": object.app.integrations.chat.publicKey,
                        "link": object.app.integrations.chat.link,
                        "metaName": object.app.integrations.chat.metaName,
                        "name": object.app.integrations.chat.name,
                        "isActive": object.app.integrations.chat.isActive,
                    },
                    "mailSender": {
                        "_id": object.app.integrations.chat._id,
                        "templateIds": object.app.integrations.chat.templateIds ? object.app.integrations.chat.templateIds.map(templateIds => {
                            return ({
                                "contactlist_Id": templateIds.contactlist_Id,
                                "functionName": templateIds.functionName,
                                "template_id": templateIds.template_id,
                            })
                        }) : object.app.integrations.chat.templateIds,
                        "apiKey": object.app.integrations.chat.apiKey,
                    },
                },
                "description": object.app.description,
                "__v": object.app.__v,
                "isWithdrawing": object.app.isWithdrawing,
                "licensesId": object.app.licensesId ? object.app.licensesId.map(licensesId => {
                    return ({
                        "_id": licensesId
                    })
                }) : object.app.licensesId,
                "countriesAvailable": object.app.countriesAvailable ? object.app.countriesAvailable.map(countriesAvailable => {
                    return ({
                        "_id": countriesAvailable
                    })
                }) : object.app.countriesAvailable,
                "withdraws": object.app.withdraws ? object.app.withdraws.map(withdraws => {
                    return ({
                        "_id": withdraws._id,
                        "app": withdraws.app,
                        "creation_timestamp": withdraws.creation_timestamp,
                        "address": withdraws.address,
                        "currency": withdraws.currency,
                        "amount": withdraws.amount,
                        "nonce": withdraws.nonce,
                        "bitgo_id": withdraws.bitgo_id,
                        "last_update_timestamp": withdraws.last_update_timestamp,
                        "logId": withdraws.logId,
                        "transactionHash": withdraws.transactionHash,
                        "link_url": withdraws.link_url,
                        "isAffiliate": withdraws.isAffiliate,
                        "status": withdraws.status,
                        "done": withdraws.done,
                        "confirmed": withdraws.confirmed,
                        "maxConfirmations": withdraws.maxConfirmations,
                        "confirmations": withdraws.confirmations,
                    })
                }) : object.app.withdraws,
                "deposits": object.app.deposits ? object.app.deposits.map(deposits => {
                    return ({
                        "_id": deposits._id,
                        "link_url": deposits.link_url,
                        "app": deposits.app,
                        "creation_timestamp": deposits.creation_timestamp,
                        "last_update_timestamp": deposits.last_update_timestamp,
                        "address": deposits.address,
                        "currency": deposits.currency,
                        "transactionHash": deposits.transactionHash,
                        "amount": deposits.amount,
                        "confirmed": deposits.confirmed,
                        "maxConfirmations": deposits.maxConfirmations,
                        "confirmations": deposits.confirmations,
                    })
                }) : object.app.deposits,
                "wallet": object.app.wallet ? object.app.wallet.map(wallet => {
                    return ({
                        "_id": wallet,
                        "depositAddresses": wallet.depositAddresses ? wallet.depositAddresses.map(depositAddresses => {
                            return ({
                                "_id": depositAddresses
                            })
                        }) : wallet.depositAddresses,
                        "currency": {
                            "_id": wallet.currency._id,
                            "image": wallet.currency.image,
                            "ticker": wallet.currency.ticker,
                            "decimals": wallet.currency.decimals,
                            "name": wallet.currency.name,
                            "address": wallet.currency.address
                        },
                        "bitgo_id": wallet.bitgo_id,
                        "hashed_passphrase": wallet.hashed_passphrase,
                        "link_url": wallet.link_url,
                        "max_withdraw": wallet.max_withdraw,
                        "max_deposit": wallet.max_deposit,
                        "bank_address": wallet.bank_address,
                        "playBalance": wallet.playBalance,
                    })
                }) : object.app.wallet,
                "external_users": object.app.external_users ? object.app.external_users.map(external_users => {
                    return ({
                        "_id": external_users
                    })
                }) : object.app.external_users,
                "users": object.app.users ? object.app.users.map(users => {
                    return ({
                        "_id": users._id,
                        "username": users.username,
                        "affiliate": users.affiliate,
                        "name": users.name,
                        "hash_password": users.hash_password,
                        "register_timestamp": users.register_timestamp,
                        "security": users.security,
                        "email": users.email,
                        "app_id": users.app_id,
                        "external_user": users.external_user,
                        "affiliateLink": users.affiliateLink,
                        "bearerToken": users.bearerToken,
                        "email_confirmed": users.email_confirmed,
                        "isWithdrawing": users.isWithdrawing,
                        "wallet": users.wallet ? users.wallet.map(wallet => {
                            return ({
                                "_id": wallet
                            })
                        }) : users.wallet,
                        "withdraws": users.withdraws ? users.withdraws.map(withdraws => {
                            return ({
                                "_id": withdraws
                            })
                        }) : users.withdraws,
                        "deposits": users.deposits ? users.deposits.map(deposits => {
                            return ({
                                "_id": deposits
                            })
                        }) : users.deposits,
                        "bets": users.bets ? users.bets.map(bets => {
                            return ({
                                "_id": bets
                            })
                        }) : users.bets,
                    })
                }) : object.app.users,
                "services": object.app.services ? object.app.services.map(services => {
                    return ({
                        "_id": services
                    })
                }) : object.app.services,
                "listAdmins": object.app.listAdmins ? object.app.listAdmins.map(listAdmins => {
                    return ({
                        "_id": listAdmins
                    })
                }) : object.app.listAdmins,
                "games": object.app.games ? object.app.games.map(games => {
                    return ({
                        "_id": games
                    })
                }) : object.app.games,
                "authorizedAddress": object.app.authorizedAddress,
                "ownerAddress": object.app.ownerAddress,
                "isValid": object.app.isValid,
            },
            "creation_timestamp": object.creation_timestamp,
            "address": object.address,
            "currency": object.currency,
            "amount": object.amount,
            "nonce": object.nonce,
            "_id": object._id,
            "link_url": object.link_url,
            "isAffiliate": object.isAffiliate,
            "status": object.status,
            "done": object.done,
            "confirmed": object.confirmed,
            "maxConfirmations": object.maxConfirmations,
            "confirmations": object.confirmations,
        }
    }
}


class RequestWithdrawApp {

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
            RequestWithdrawApp: 'requestWithdrawApp'
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

let RequestWithdrawAppSingleton = new RequestWithdrawApp();

export {
    RequestWithdrawAppSingleton
}