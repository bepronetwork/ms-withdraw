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
        let decodedLogsEventTransfer = decodedLogs[0].events;
        let tokensTransferedTo = decodedLogsEventTransfer[1].value;
        let tokensTransferedFrom = decodedLogsEventTransfer[0].value;
        let tokenAmount = decodedLogsEventTransfer[2].value;

        /* Response Object */
        let res = {
            tokensTransferedFrom,
            tokensTransferedTo,
            tokenAmount
        }

        return res;   
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