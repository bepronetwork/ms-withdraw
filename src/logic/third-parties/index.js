import GoogleStorageSingleton from './googleStorage';
import HerokuClientSingleton from './heroku';
import { SendInBlue , SendinBlueSingleton} from './sendInBlue';
const SendInBlueFunctions = require('./sendInBlue/functions.json');
const SendInBlueAttributes = require('./sendInBlue/fields.json');
import { LogOwlSingleton } from "./logOwl";
import { MatiKYCSingleton } from "./mati_kyc";
import { TrustologySingleton } from "./trustology";
import PusherSingleton from "./pusher";

export {
    LogOwlSingleton,
    GoogleStorageSingleton,
    HerokuClientSingleton,
    SendinBlueSingleton,
    SendInBlue,
    SendInBlueFunctions,
    SendInBlueAttributes,
    MatiKYCSingleton,
    TrustologySingleton,
    PusherSingleton
}