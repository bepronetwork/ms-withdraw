export const template =
    [
        {
            "template_id": null,
            "functionName": "USER_REGISTER",
            "contactlist_Id": 2,
            "attributes": {

            }
        },
        {
            "template_id": null,
            "functionName": "USER_LOGIN",
            "contactlist_Id": 2,
            "attributes": {

            }
        },
        {
            "template_id": null,
            "functionName": "USER_RESET_PASSWORD",
            "contactlist_Id": 2,
            "attributes": {

            }
        },
        {
            "template_id": null,
            "functionName": "USER_TEXT_DEPOSIT_AND_WITHDRAW",
            "contactlist_Id": 2,
            "attributes": {
                "TEXT": (params) => {
                    return {
                        "deposit": `There is a deposit of ${params.amount} ${params.ticker} in your account`,
                        "withdraw": `There is a withdraw of ${params.amount} ${params.ticker} in your account`
                    }
                }
            }
        }
    ]