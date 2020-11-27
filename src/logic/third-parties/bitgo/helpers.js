import { throwError } from "../../../controllers/Errors/ErrorManager";
import { maxWithdrawPolicyPerDay, maxWithdrawPolicyPerTransaction, maxWithdrawPolicyPerHour } from "./const";
import { generateRandomID } from "../../services/services";
import { IS_DEVELOPMENT } from "../../../config";

export const normalizePolicy = ({timeWindow, ticker}) => {

    var time;

    switch(new String(timeWindow).toLowerCase()){
        case 'hour' : {
            time =  60*60; break;
        };
        case 'day' : {
            time =  60*60*24; break;
        };
        case 'transaction' : {
            time = 0; break;
        };
        default : {
            // no time window
            throwError('UNKNOWN');
        }
    }
    let maxWithdraw = getMaxWithdraw({ticker, timeWindow});

    const policy = {
        action: {
            type: 'getApproval'
        },
        condition: {
            amountString: new String(getCurrencyAmountToBitGo({ticker, amount : maxWithdraw})).toString(),
            excludeTags: [],
            groupTags: [':tag'],
            timeWindow: time
        },
        id: `policy-${generateRandomID()}`,
        type: 'velocityLimit'
    };

    return policy;
}


export const getCurrencyAmountToBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseFloat(amount)*1000000000000000000;
        };
        case 'usdc' : {
            // 6 decimals
            return parseFloat(amount)*1000000;
        };
        case 'dai' : {
            // 18 decimals
            return parseFloat(amount)*1000000000000000000;
        };
        case 'fft' : {
            // 18 decimals
            return parseFloat(amount)*1000000000000000000;
        };
        case 'usdt' : {
            // 6 decimals
            return parseFloat(amount)*1000000;
        };
        case 'btc' : {
            // to satoshi
            return parseFloat(amount)*100000000;
        }
    }
}


export const getCurrencyAmountFromBitGo = ({ticker, amount}) => {
    
    switch(new String(ticker).toLowerCase().trim()){
        case 'eth' : {
            // to wei
            return parseFloat(amount)/1000000000000000000;
        };
        case 'fau' : {
            // to wei
            return parseFloat(amount)/1000000000000000000;
        };
        case 'usdc' : {
            // 6 decimals
            return parseFloat(amount)/1000000;
        };
        case 'dai' : {
            // 18 decimals
            return parseFloat(amount)/1000000000000000000;
        };
        case 'fft' : {
            // 18 decimals
            return parseFloat(amount)/1000000000000000000;
        };
        case 'usdt' : {
            // 6 decimals
            return parseFloat(amount)/1000000;
        };
        case 'btc' : {
            // to satoshi
            return parseFloat(amount)/100000000;
        }
    }
}


export const getMaxWithdraw = ({ticker, timeWindow}) => {
    switch(new String(timeWindow).toLowerCase().trim()){
        case 'transaction' : {
            return maxWithdrawPolicyPerTransaction[new String(ticker).toLowerCase()];
        };
        case 'day' : {
            return maxWithdrawPolicyPerDay[new String(ticker).toLowerCase()];
        };
        case 'hour' : {
            return maxWithdrawPolicyPerHour[new String(ticker).toLowerCase()];
        };
    }
}


export const getNormalizedTicker = ({ticker}) => {    
    return IS_DEVELOPMENT ? new String(ticker.substr(1)).toLowerCase() : ticker;
}
