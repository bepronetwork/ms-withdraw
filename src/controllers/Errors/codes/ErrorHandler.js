

var ErrorHandler = function(){}


ErrorHandler.prototype.errors = require('./codes.json');

/***************************
 * 
 *  @param { DEFINE KEYS }
 *        
 *         ALL KEYS
 * 
 ****************************/

ErrorHandler.prototype.KEYS =  {
    'UNKNOWN'                               : "000",
    'INSUFFICIENT_FUNDS'                    : "001",
    'INVALID_AMOUNT'                        : "002",
    'INVALID_ODD'                           : "003",
    'USER_NOT_EXISTENT'                     : "004",
    'WRONG_PASSWORD'                        : "005",
    'INVALID_BET_QUANTITY'                  : "006",
    'ALREADY_EXISTING_USER'                 : "007",
    'ALREADY_EXISTING_EMAIL'                : "008",
    'INSUFFICIENT_LIQUIDITY'                : "009",
    'DEPOSIT_TRANSACTION_NOT_VALID'         : "010",
    'ALREADY_EXISTING_DEPOSIT_TRANSACTION'  : "011",
    'APP_NOT_EXISTENT'                      : "012",
    'BAD_BET'                               : "013",
    'WITHDRAW_MODE_IN_API'                  : "014",
    'WITHDRAW_MODE_IN_SMART_CONTRACT'       : "015",
    'BAD_SIGNED_MESSAGE'                    : "016",
    'BAD_WITHDRAW_AMOUNT_SIGNED'            : "017",
    'WITHDRAW_AMOUNT_IS_NOT_RIGHT'          : "018",
    'WITHDRAW_ALREADY_ADDED'                : "019",
    'USER_ADDRESS_IS_NOT_VALID'             : "020",
    'WITHDRAW_NOT_ENOUGH_BALANCE'           : "021",
    'WITHDRAW_IN_PLACE'                     : "022",
    'APP_ADDRESS_IS_NOT_VALID'              : "023",
    'TRANSACTION_NOT_VALID'                 : "024",
    'NEGATIVE_AMOUNT'                       : "025",
    'WITHDRAW_ID_NOT_DEFINED'               : "026",
    'GAME_NOT_EXISTENT'                     : "027",
    'BAD_NONCE'                             : "028",
    'TABLE_LIMIT_SUPRASSED'                 : "029",
    'BAD_LIMIT_TABLE'                       : "030",
    'EDIT_TABLE_NOT_VALID'                  : "031",
    'EDIT_EDGE_NOT_VALID'                   : "032",
    'BAD_EDGE'                              : "033",
    'USER_NOT_EXISTENT_IN_APP'              : "034",
    'USER_HAS_2FA_DEACTIVATED'              : "035",
    'WRONG_2FA_TOKEN'                       : "036",
    'USER_HAS_2FA'                          : "037",
    'APP_ALREADY_EXISTENT'                  : "038",
    'ERROR_TRANSACTION'                     : "039",
    'MIN_WITHDRAW_NOT_PASSED'               : "040",
    'CURRENCY_NOT_EXISTENT'                 : "045",
    'MAX_WITHDRAW'                          : "046",
    'EMAIL_NOT_CONFIRMED'                   : "047",
    'MIN_WITHDRAW'                          : "048",
    'WITHDRAW_FEE'                          : "049",
    'HAS_BONUS_YET'                         : "050",
    'KYC_NEEDED'                            : "051",
    'AFFILIATE_RETURN_NOT_VALID'            : "052",
    'AFFILIATE_NOT_EXISTENT'                : "053",
    'ERROR_AFFILIATE_EDIT'                  : "054",
    'BAD_REQUEST'                           : "055",
    'CURRENCY_ALREADY_EXISTENT'             : "056",
    'NO_PASSPHRASE_WALLET'                  : "057",
    'TOKEN_EXPIRED'                         : "058",
    'TOKEN_INVALID'                         : "059",
    'APP_INVALID'                           : "060",
    'OVERFLOW_DEPOSIT'                      : "061",
    'MAX_BET_NOT_EXISTENT'                  : "062",
    'MAX_BET_ACHIEVED'                      : "063",
    'USERNAME_ALREADY_EXISTS'               : "064",
    'USERNAME_OR_EMAIL_NOT_EXISTS'          : "065",
    'JACKPOT_NOT_EXIST_IN_APP'              : "066",
    'NOT_A_VIRTUAL_CASINO'                  : "067",
    'IS_VIRTUAL_WALLET'                     : "068",
    'UNAUTHORIZED_COUNTRY'                  : "069",
    'IS_ETHEREUM_WALLET'                    : "070",
    'WRONG_THEME'                           : "071",
    'ADD_ON_NOT_EXISTS'                     : "072",
    'ADD_ON_DEPOSIT_BONUS_NOT_EXISTS'       : "073",
    'INVALID_DEPOSIT_BONUS_PERCENTAGE'      : "074",
    'INVALID_DEPOSIT_BONUS_MAX_DEPOSIT'     : "075",
    'INVALID_DEPOSIT_BONUS_MIN_DEPOSIT'     : "076",
    'ADDRESS_NOT_AVAILABLE'                 : "077",
    'NO_ETH_WALLET'                         : "078",
    'ADD_ON_POINT_SYSTEM_NOT_EXISTS'        : "079",
    'UNCONFIRMED_EMAIL'                     : "080",
    'WALLET_WAIT'                           : "081",
    'PAYMENT_FORWARDING_TRANSACTION'        : "082",
    'WRONG_SKIN'                            : "083",
    'ICONS_LIMIT_EXCEEDED'                  : "084",
    'LOGIN_NOT_CURRENCY_ADDED'              : "085",
    'MINIMUM_PASSWORD_LENGTH'               : "086",
    'REGISTER_NOT_CURRENCY_ADDED'           : "087",
    'NO_FREE_CURRENCY'                      : "088",
    'FREE_CURRENCY_NO_ACTIVATED'            : "089",
    'INSUFFICIENT_FUNDS_APP'                : "090",
    'LANGUAGE_NOT_EXISTENT'                 : "091",
    'DEPOSIT_MODE_IN_API'                   : "092",
    'INSUFFICIENT_AGE'                      : "093",
    'COUNTRY_RESTRICTED'                    : "094",
    'DEPLOY_ERROR'                          : "095"
};


  /***************************
 * 
 *      
 *         GET METHODS
 * 
 * 
 ****************************/
ErrorHandler.prototype.getMessage = function(code){
    return this.errors[code].message;
}

ErrorHandler.prototype.getKey = function(code){
    return this.errors[code].key;
}

ErrorHandler.prototype.getError = function(code, messageParams = ''){
    return {
        key     : this.getKey(code),
        code    : parseInt(code),
        message : this.getMessage(code) + messageParams
    }
}


ErrorHandler.prototype.getCode = (code) => {
    let codes = Object.keys(this.errors);
    return codes.find( c => c.equals(code));
}


module.exports = ErrorHandler;
