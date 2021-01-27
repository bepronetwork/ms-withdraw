class ConvertData {
    getDataWebHook(req) {
        const data   = req.body;
        const header = {
            type    : data.payload.subWalletId.type,
            isToken : (data.payload.tokensData!=null && data.payload.tokensData.length > 0)
        }

        let filter = {};
        switch (header.type) {
            case "BTC":
                filter["amount"]            = data.payload.transactionAmountInBtc;
                filter["tx"]                = data.payload.transactionId;
                filter["subWalletIdString"] = data.payload.subWalletIdString;
                filter["transactionType"]   = data.payload.transactionType;
                break;
            case "ETH":
                filter["amount"]            = data.payload.transactionValueInEth;
                filter["tx"]                = data.payload.transactionId;
                filter["subWalletIdString"] = data.payload.subWalletIdString;
                filter["transactionType"]   = data.payload.transactionType;
                if(header.isToken){
                    filter["tokensData"]   = data.payload.tokensData;
                }
                break;
        }

        return {
            ...header,
            data: filter
        }
    }
}
const convertDataSingleton = new ConvertData();
export {
    convertDataSingleton
}