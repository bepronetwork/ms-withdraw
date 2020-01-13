import { globals } from "../../Globals";
import Numbers from "../services/numbers";

export function detectCurrencyAmountToSmartContractAmount({currency, amount}){
    switch(new String(currency.ticker).toLowerCase().trim()){
        case 'eth' : {
            const weiAmount = globals.web3.utils.toWei(new String(amount).toString());
            return parseInt(Math.abs(weiAmount));
        };
        default : {
            return parseInt(Math.abs(Numbers.toSmartContractDecimals(amount, currency.decimals)));
        }
    }
}