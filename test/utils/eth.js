import { globals } from "../Globals";
import account from "../logic/eth/models/account";


export async function generateEthAccountWithTokensAndEthereum({tokenAmount, ETHAmount}){
    let acc = new account(globals.web3, globals.web3.eth.accounts.create());
    //let erc20Contract = globals.getERC20Contract(globals.constants.erc20TokenAddress);
    //Transfer Tokens
    //await erc20Contract.transferTokenAmount({fromAccount : globals.masterAccount, toAddress : acc.getAddress(), tokenAmount : tokenAmount, decimals : globals.constants.tokenDecimals});
    //Transfer Ethereum
    await globals.masterAccount.sendEther(ETHAmount, acc.getAddress());
    return acc;
}

