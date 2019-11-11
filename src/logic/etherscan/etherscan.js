import { casino, ierc20 } from '../eth/interfaces/index';

const abiDecoder = require('abi-decoder'); // NodeJS


class Etherscan{

    constructor(){
        this.abiDecoder = abiDecoder;
        this.abiDecoder.addABI(casino.abi);
        this.abiDecoderERC20 = abiDecoder;
        this.abiDecoderERC20.addABI(ierc20.abi);
    }

    getTransactionDataCasino = (transaction_data_encoded, transaction_recipt_encoded) => {
        const input = transaction_data_encoded.input;
        const decodedInput = this.abiDecoder.decodeMethod(input);
        const functionName = decodedInput.name;
        const functionParams = decodedInput.params;

        let decodedLogs = this.abiDecoder.decodeLogs(transaction_recipt_encoded.logs);
        let decodedLogsEventTransfer = decodedLogs[0].events;
        let tokensTransferedTo = decodedLogsEventTransfer[1].value;
        /* Response Object */
        let res = {
            tokensTransferedTo : tokensTransferedTo,
            functionName : functionName,
            from : transaction_data_encoded.from,
            tokenAmount : functionParams[0].value
        }

        return res;
    }

    getTransactionDataCasinoWithdraw = (transaction_recipt_encoded) => {

        let decodedLogs = this.abiDecoder.decodeLogs(transaction_recipt_encoded.logs);
        /* Get Info on Transfer Types */
        let transfers = decodedLogs.map( d => {
            if(new String(d.name).toLowerCase().trim() == 'transfer'){
                /* Transfer Log */
                return {
                    tokensTransferedFrom :  d.events[0].value,
                    tokensTransferedTo : d.events[1].value,
                    tokenAmount : d.events[2].value
                }
            }else{
                /* Withdraw Log aka Redundant*/
            }
        }).filter(el => el!=null);

        return transfers;   
    }

    getTransactionDataERC20 = (transaction_data_encoded) => {
        const input = transaction_data_encoded.input;
        const decodedInput = this.abiDecoderERC20.decodeMethod(input);
        const functionName = decodedInput.name;
        const functionParams = decodedInput.params;
        let tokensTransferedTo = functionParams[0].value;
      
        /* Response Object */
        let res = {
            tokensTransferedTo : tokensTransferedTo,
            functionName : functionName,
            from : transaction_data_encoded.from,
            tokenAmount : functionParams[1].value
        }

        return res;
        
    }
}

let EtherscanSingleton = new Etherscan();

export default EtherscanSingleton;