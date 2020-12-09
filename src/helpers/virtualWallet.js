import { compareCurrencyId } from "./currency";

export function getVirtualAmountFromRealCurrency({currency, virtualWallet, currencyAmount}){
    const priceObject = virtualWallet.price.find( p => compareCurrencyId(p.currency, currency._id));
    return parseFloat(parseFloat(currencyAmount)/parseFloat(priceObject.amount))
}