import Numbers from "../logic/services/numbers";
import { globals } from "../Globals";
import account from "../logic/eth/models/account";
import CasinoContract from "../logic/eth/CasinoContract";
import CasinoContractETH from '../logic/eth/CasinoContractETH';


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


export async function deploySmartContract({eth_account, decimals, tokenAddress}){
    try{
        let erc20Contract = globals.getERC20Contract(tokenAddress);

        let casino = new CasinoContract({
            web3 : globals.web3,
            authorizedAddress : globals.croupierAccount.getAddress(),
            account : eth_account,
            erc20TokenContract : erc20Contract,
            decimals : decimals,
            tokenTransferAmount : globals.constants.deploy.tokenTransferAmount
        })
       

        let res = await casino.__init__();
        await casino.authorizeCroupier(globals.croupierAccount.getAddress());
        await casino.authorizeAddress(eth_account.getAddress());

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


export async function deploySmartContractETH({eth_account}){
    try{
        let casino = new CasinoContractETH({
            web3 : globals.web3,
            authorizedAddress : globals.croupierAccount.getAddress(),
            account : eth_account
        })
       

        let res = await casino.__init__();
        await casino.authorizeCroupier(globals.croupierAccount.getAddress());
        await casino.authorizeAddress(eth_account.getAddress());

        return {    
            casino : casino,
            transactionHash         : res.transactionHash,
            platformAddress         : casino.getAddress(),
            platformBlockchain      : 'eth',
            casinoContract          : casino
        };
        
    }catch(err){
        return false;
    }
}

export async function userDepositToContract({eth_account, platformAddress, tokenAmount, currency}){
    try{
        switch(new String(currency.ticker).toLowerCase()){
            case 'eth': {
                let casinoContract = new CasinoContractETH({
                    web3 : global.web3,
                    account : eth_account,
                    contractAddress: platformAddress
                })
            
                /* Deposit Tokens */
                return await casinoContract.sendTokensToCasinoContract(tokenAmount);
            };
            default : {
                let erc20Contract = globals.getERC20Contract(currency.address);

                let casinoContract = new CasinoContract({
                    web3 : global.web3,
                    account : eth_account,
                    erc20TokenContract : erc20Contract,
                    contractAddress: platformAddress,
                    decimals : currency.decimals
                })
                
            
                /* Deposit Tokens */
                return await casinoContract.sendTokensToCasinoContract(tokenAmount);
            };
        }

    }catch(err){
        throw err;
    }
}


export async function appWithdrawForUser({eth_account, platformAddress, tokenAmount, currency}){
    try{
        let erc20Contract = globals.getERC20Contract(currency.address);

        let casinoContract = new CasinoContract({
            web3 : global.web3,
            account : global.test.admin_eth_account,
            erc20TokenContract : erc20Contract,
            contractAddress: platformAddress,
            decimals : currency.decimals,
        });
        
        /* Withdraw Tokens to User */
        return await casinoContract.withdrawUserFundsAsOwner({
            userAddress : eth_account.getAddress(),
            amount : tokenAmount,
        });
        
    }catch(err){
        console.log(err);
        return false
    }
}

export async function appWithdrawForUserBatch({platformAddress, addresses, amounts, currency}){
    try{
        switch(new String(currency.ticker).toLowerCase()){
            case 'eth': {

                let casinoContract = new CasinoContractETH({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    contractAddress: platformAddress
                });
                
                /* Withdraw Tokens to User */
                return await casinoContract.withdrawUserFundsAsOwnerBatch({
                    addresses : addresses,
                    amounts : amounts
                });
            };
            default : {
                let erc20Contract = globals.getERC20Contract(currency.address);

                let casinoContract = new CasinoContract({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    erc20TokenContract : erc20Contract,
                    contractAddress: platformAddress,
                    decimals : currency.decimals,
                });
                
                /* Withdraw Tokens to User */
                return await casinoContract.withdrawUserFundsAsOwnerBatch({
                    addresses : addresses,
                    amounts : amounts
                });
            }
        }
    }catch(err){
        console.log(err);
        return false
    }
}

export async function appDepositToContract({tokenAmount, currency, platformAddress}){
    try{
        switch(new String(currency.ticker).toLowerCase()){
            case 'eth': {
                let casinoContract = new CasinoContractETH({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    contractAddress: platformAddress
                })
            
                /* Deposit Tokens */
                return await casinoContract.sendTokensToCasinoContract(tokenAmount);
            };
            default : {
                let erc20Contract = globals.getERC20Contract(currency.address);

                let casinoContract = new CasinoContract({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    erc20TokenContract : erc20Contract,
                    contractAddress: platformAddress,
                    decimals : currency.decimals
                })
                
            
                /* Deposit Tokens */
                return await casinoContract.sendTokensToCasinoContract(tokenAmount);
            };
        }
    }catch(err){
        console.log(err);
        return false;
    }
}

export async function appWithdrawFromContract({currency, account, tokenAmount, platformAddress}){

    try{
        switch(new String(currency.ticker).toLowerCase()){
            case 'eth': {
                let casinoContract = new CasinoContractETH({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    contractAddress: platformAddress
                })
            
                /* Deposit Tokens */
                return await casinoContract.withdrawApp({
                    receiverAddress : account.getAddress(), account, amount : tokenAmount 
                });
            };
            default : {
                let erc20Contract = globals.getERC20Contract(currency.address);

                let casinoContract = new CasinoContract({
                    web3 : global.web3,
                    account : global.test.admin_eth_account,
                    erc20TokenContract : erc20Contract,
                    contractAddress: platformAddress,
                    decimals : currency.decimals
                })
                
            
                /* Deposit Tokens */
                return await casinoContract.withdrawApp({
                    receiverAddress : account.getAddress(), account, amount : tokenAmount 
                });
            };
        }
    }catch(err){
        console.log(err);
        return false;
    }
}