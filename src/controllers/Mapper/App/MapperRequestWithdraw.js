
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
                "currencies": object.app.currencies ? object.app.currencies.map(currency_id => {
                    return({
                        "_id": currency_id
                    })
                }) : object.app.currencies,
                "typography": object.app.typography ? object.app.typography.map(typography_id => typography_id) : object.app.typography,
                "name": object.app.name,
                "affiliateSetup": {
                    "_id": object.app.affiliateSetup._id,
                    "customAffiliateStructures": object.app.affiliateSetup.customAffiliateStructures ? object.app.affiliateSetup.customAffiliateStructures.map(customAffiliateStructure_id => customAffiliateStructure_id) : object.app.affiliateSetup.customAffiliateStructures,
                    "affiliateStructures": object.app.affiliateSetup.affiliateStructures ? object.app.affiliateSetup.affiliateStructures.map(affiliateStructure => {
                        return ({
                            "_id": affiliateStructure._id,
                            "level": affiliateStructure.level,
                            "percentageOnLoss": affiliateStructure.percentageOnLoss,
                            "isActive": affiliateStructure.isActive,
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
                        }) : object.app.integrations.chat.templateIds
                    },
                },
                "description": object.app.description,
                "__v": object.app.__v,
                "isWithdrawing": object.app.isWithdrawing,
                "licensesId": object.app.licensesId ? object.app.licensesId.map(license_id => license_id) : object.app.licensesId,
                "countriesAvailable": object.app.countriesAvailable ? object.app.countriesAvailable.map(countrieAvailable_id => countrieAvailable_id) : object.app.countriesAvailable,
                "withdraws": object.app.withdraws ? object.app.withdraws.map(withdraw => {
                    return ({
                        "_id": withdraw._id,
                        "app": withdraw.app,
                        "creation_timestamp": withdraw.creation_timestamp,
                        "address": withdraw.address,
                        "currency": withdraw.currency,
                        "amount": withdraw.amount,
                        "nonce": withdraw.nonce,
                        "bitgo_id": withdraw.bitgo_id,
                        "last_update_timestamp": withdraw.last_update_timestamp,
                        "logId": withdraw.logId,
                        "transactionHash": withdraw.transactionHash,
                        "link_url": withdraw.link_url,
                        "isAffiliate": withdraw.isAffiliate,
                        "status": withdraw.status,
                        "done": withdraw.done,
                        "confirmed": withdraw.confirmed,
                        "maxConfirmations": withdraw.maxConfirmations,
                        "confirmations": withdraw.confirmations,
                    })
                }) : object.app.withdraws,
                "deposits": object.app.deposits ? object.app.deposits.map(deposit => {
                    return ({
                        "_id": deposit._id,
                        "link_url": deposit.link_url,
                        "app": deposit.app,
                        "creation_timestamp": deposit.creation_timestamp,
                        "last_update_timestamp": deposit.last_update_timestamp,
                        "address": deposit.address,
                        "currency": deposit.currency,
                        "transactionHash": deposit.transactionHash,
                        "amount": deposit.amount,
                        "confirmed": deposit.confirmed,
                        "maxConfirmations": deposit.maxConfirmations,
                        "confirmations": deposit.confirmations,
                    })
                }) : object.app.deposits,
                "wallet": object.app.wallet ? object.app.wallet.map(wallet => {
                    return ({
                        "_id": wallet._id,
                        "depositAddresses": wallet.depositAddresses ? wallet.depositAddresses.map(depositAddress_id => {
                            return({
                                "_id": depositAddress_id
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
                        "link_url": wallet.link_url,
                        "max_withdraw": wallet.max_withdraw,
                        "min_withdraw": wallet.min_withdraw,
                        "affiliate_min_withdraw": wallet.affiliate_min_withdraw,
                        "max_deposit": wallet.max_deposit,
                        "bank_address": wallet.bank_address,
                        "playBalance": wallet.playBalance,
                    })
                }) : object.app.wallet,
                "external_users": object.app.external_users ? object.app.external_users.map(externalUser_id => externalUser_id) : object.app.external_users,
                "users": object.app.users ? object.app.users.map(user => {
                    return ({
                        "_id": user._id,
                        "username": user.username,
                        "affiliate": user.affiliate,
                        "name": user.name,
                        "register_timestamp": user.register_timestamp,
                        "security": user.security,
                        "email": user.email,
                        "app_id": user.app_id,
                        "external_user": user.external_user,
                        "affiliateLink": user.affiliateLink,
                        "bearerToken": user.bearerToken,
                        "email_confirmed": user.email_confirmed,
                        "isWithdrawing": user.isWithdrawing,
                        "wallet": user.wallet ? user.wallet.map(wallet_id => {
                            return({
                                "_id": wallet_id
                            })
                        }) : user.wallet,
                        "withdraws": user.withdraws ? user.withdraws.map(withdraw_id => {
                            return({
                                "_id": withdraw_id
                            })
                        }) : user.withdraws,
                        "deposits": user.deposits ? user.deposits.map(deposit_id => {
                            return({
                                "_id": deposit_id
                            })
                        }) : user.deposits,
                        "bets": user.bets ? user.bets.map(bet_id => {
                            return({
                                "_id": bet_id
                            })
                        }) : user.bets,
                    })
                }) : object.app.users,
                "services": object.app.services ? object.app.services.map(service_id => service_id) : object.app.services,
                "listAdmins": object.app.listAdmins ? object.app.listAdmins.map(listAdmins_id => {
                    return({
                        "_id": listAdmins_id
                    })
                }) : object.app.listAdmins,
                "games": object.app.games ? object.app.games.map(game_id => {
                    return({
                        "_id": game_id
                    })
                }): object.app.games,
                "authorizedAddress": object.app.authorizedAddress,
                "whitelistedAddresses": object.app.whitelistedAddresses,
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