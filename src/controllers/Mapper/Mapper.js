
let self;


/**
 * @Outputs 
 * @method Private Outputs Functions
 * @default 1Level Tier Object
 */



let outputs = {
    app : (object) => {
        return {
            "id"                    : object._id,
            "name"                  : object.name,
            "description"           : object.description,
            "isValid"               : object.isValid,
            "currencyTicker"        : object.currencyTicker,
            "decimals"              : object.decimals,
            "platformAddress"       : object.platformAddress,
            "platformBlockchain"    : object.platformBlockchain,
            "platformTokenAddress"  : object.platformTokenAddress,
            "licensesId"            : object.licensesId,
            "countriesAvailable"    : object.countriesAvailable,
            "games"                 : object.games ? object.games.map( game => {
                return {
                    _id : game._id,
                    edge : game.edge,
                    name : game.name,
                    metaName : game.metaName,
                    image_url : game.image_url,
                    description : game.description,
                    resultSpace : game.resultSpace,
                    tableLimit : game.tableLimit,
                    isClosed : game.isClosed
                }
            }) : [],
        }
    },
    user : (object) => {
        return {
            "username"  : object.username,
            "email"     : object.email,
            "id"        : object._id,
            "name"      : object.name,
            "address"   : object.address,
            "wallet"    : {
                "playBalance" : object.wallet.playBalance
            },
            "withdraws" : object.withdraws,
            "deposits"  : object.deposits,
            "verifiedAccounts" : object.verifiedAccount
        }
    }
}


class Mapper{

    constructor(){
        self = {
            outputs : outputs
        }

        /**
         * @object KEYS for Output Mapping
         * @key Input of Output Function <-> Output for Extern of the API
         * @value Output of Function in Outputs
         */

        this.KEYS = {
            User : 'user',
            App : 'app',
        }
    }

    output(key, value){
        try{
            return self.outputs[this.KEYS[key]](value);
        }catch(err){
            throw err;
        }
    }
}

let MapperSingleton = new Mapper();

export{
    MapperSingleton
}