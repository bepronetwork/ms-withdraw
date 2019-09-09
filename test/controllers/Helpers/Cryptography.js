import { globals } from "../../Globals";
import Numbers from "../../logic/services/numbers";

var SHA512 = require("crypto-js/hmac-sha512");
var SHA512_HASH = require("crypto-js/sha512");
var randomstring = require("randomstring");
var randomHex = require('randomhex');


class Cryptography{

    constructor(){

    }

    generateSeed(length = 32){
        return randomHex(length);
    }

    hashSeed(seed){
        return SHA512_HASH(seed);
    }

    generateNonce(){
        return Math.floor(Math.random() * 10000000000000000) + 1;
    }

    generateRandomResult(server_seed, client_seed, nonce){
        let randomHex = SHA512(server_seed, client_seed);
        return randomHex;

    }

    hexToInt = (randomHex) => {
        // TO DO : If this number is over 999,999 than the next 5 characters (ex : aad5e) would be used. But in our case it's 697,969 so this will be used. Now you only have to apply a modulus of 10^4 and divide it by 100
        let hexString = randomHex.toString().substring(0, 5);
        return parseInt(hexString, 16)%(10000)/100;
    }

    generatePrivateKey = () => {
        return '0x' + randomstring.generate({
            charset: 'hex',
            length : 64
        });
    }


    getUserSignature({clientAccount, winBalance, nonce, category, decimals}){
        
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

}

let CryptographySingleton = new Cryptography();

export default CryptographySingleton;