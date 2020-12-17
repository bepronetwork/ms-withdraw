const wallet_update_object = (object) => {
    return {
        "id": object._id,
        "depositAddresses": object.depositAddresses ? object.depositAddresses.map(deposit_address => {
            return ({
                "_id": deposit_address._id,
                "currency": deposit_address.currency,
                "user": deposit_address.user,
            })
        }) : object.depositAddresses,
        "virtual": object.virtual,
        "image": object.image,
        "currency": object.currency,
        "price": object.price,
        "min_withdraw": object.min_withdraw,
        "link_url": object.link_url,
        "max_withdraw": object.max_withdraw,
        "affiliate_min_withdraw": object.affiliate_min_withdraw,
        "max_deposit": object.max_deposit,
        "bank_address": object.bank_address,
        "playBalance": object.playBalance,
        "__v": object.__v
    }
}


export {
    wallet_update_object
}