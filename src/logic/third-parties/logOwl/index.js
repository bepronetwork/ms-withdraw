const logowl = require('@logowl/adapter-nodejs');
import { LOGOWL_TICKET } from "../../../config";

class LogOwl {
    constructor() {
        logowl.init({ ticket: LOGOWL_TICKET });
    }
    pushError(error, {admin, user, route, app}) {
        logowl.emitError(error, {admin, user, route, app});
    }
}

let LogOwlSingleton = new LogOwl();

export {
    LogOwlSingleton
}