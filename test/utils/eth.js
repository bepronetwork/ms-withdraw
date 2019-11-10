import Numbers from "../logic/services/numbers";
import { globals } from "../Globals";
import account from "../logic/eth/models/account";
import CasinoContract from "../logic/eth/CasinoContract";

export async function getUserSignature({clientAccount, winBalance, nonce, category, decimals}){
    
    let message =  globals.web3.utils.soliditySha3(
        {type: 'int128', value :  Numbers.fromExponential(Numbers.toSmartContractDecimals(winBalance, decimals))},
        {type: 'uint128', value: nonce},
        {type: 'uint8', value: category}
    );

    let response = clientAccount.getAccount().sign(message, clientAccount.getPrivateKey());

    return {
        signature : response,
        nonce,
        category,
        address : clientAccount.getAddress()
    };
}
  

export async function generateEthAccountWithTokensAndEthereum({tokenAmount, ETHAmount}){
    let acc = new account(globals.web3, globals.web3.eth.accounts.create());
    let erc20Contract = globals.getERC20Contract(globals.constants.erc20TokenAddress);
    //Transfer Tokens
    await erc20Contract.transferTokenAmount({fromAccount : globals.masterAccount, toAddress : acc.getAddress(), tokenAmount : tokenAmount, decimals : globals.constants.tokenDecimals});
    //Transfer Ethereum
    await globals.masterAccount.sendEther(ETHAmount, acc.getAddress());
    return acc;
}


export async function deploySmartContract({eth_account}){
    try{
        let erc20Contract = globals.getERC20Contract(globals.constants.erc20TokenAddress);

        let casino = new CasinoContract({
            web3 : globals.web3,
            authorizedAddress : globals.croupierAccount.getAddress(),
            account : eth_account,
            erc20TokenContract : erc20Contract,
            decimals : globals.constants.tokenDecimals,
            tokenTransferAmount : globals.constants.deploy.tokenTransferAmount
        })
       

        let res = await casino.__init__();
        await casino.setMaxWithdrawal(globals.constants.deploy.maxWithdrawal);
        await casino.setMaxDeposit(globals.constants.deploy.maxDeposit);

        return {    
            casino : casino,
            platformTokenAddress    : globals.constants.erc20TokenAddress,
            transactionHash         : res.transactionHash,
            platformAddress         : casino.getAddress(),
            platformBlockchain      : 'eth',
            amount                  : globals.constants.deploy.tokenTransferAmount,
            casinoContract          : casino
        };
        
    }catch(err){
        return false;
    }
}

export async function userDepositToContract({eth_account, platformAddress, tokenAmount}){
    try{
        let erc20Contract = globals.getERC20Contract(globals.constants.erc20TokenAddress);

        let casinoContract = new CasinoContract({
            web3 : global.web3,
            account : eth_account,
            erc20TokenContract : erc20Contract,
            contractAddress: platformAddress,
            decimals : globals.constants.tokenDecimals,
        })
       
        /* Deposit Tokens */
        return await casinoContract.depositFunds({amount : tokenAmount});

    }catch(err){
        throw err;
    }
}


export async function userWithdrawFromContract({eth_account, platformAddress, tokenAmount}){
    try{
        let erc20Contract = globals.getERC20Contract(globals.constants.erc20TokenAddress);

        let casinoContract = new CasinoContract({
            web3 : global.web3,
            account : eth_account,
            erc20TokenContract : erc20Contract,
            contractAddress: platformAddress,
            decimals : globals.constants.tokenDecimals,
        })
        /* Deposit Tokens */
        return await casinoContract.withdrawFunds({
            amount : tokenAmount,
        });

    }catch(err){
        return false
    }
}

export async function appDepositToContract({casinoContract, tokenAmount}){
    try{        
        return await casinoContract.sendTokensToCasinoContract(tokenAmount);
    }catch(err){
        console.log(err);
        return err;
    }
}

export async function appWithdrawFromContract({casinoContract, account, address, tokenAmount}){
    try{        
        return await casinoContract.withdrawApp({ receiverAddress : address, account, amount : tokenAmount });
    }catch(err){
        return false
    }
}

