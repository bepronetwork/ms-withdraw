

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
    'UNKNOWN'                   : "000",
    'INSUFFICIENT_FUNDS'        : "001",
    'INVALID_AMOUNT'            : "002",
    'INVALID_ODD'               : "003",
    'USER_NOT_EXISTENT'         : "004",
    'WRONG_PASSWORD'            : "005",
    'INVALID_BET_QUANTITY'      : "006",
    'ALREADY_EXISTING_USER'     : "007",
    'ALREADY_EXISTING_EMAIL'    : "008",
    'INSUFFICIENT_LIQUIDITY'    : "009",
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
    'ERROR_TRANSACTION'                     : "039"
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

ErrorHandler.prototype.getError = function(code){
    return {
        key     : this.getKey(code),
        code    : parseInt(code),
        message : this.getMessage(code)
    }
}


ErrorHandler.prototype.getCode = (code) => {
    let codes = Object.keys(this.errors);
    return codes.find( c => c.equals(code));
}


module.exports = ErrorHandler;
