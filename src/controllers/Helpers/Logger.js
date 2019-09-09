
const LOG = (process.env.LOG || true);

var Logger = () => {

    function log(message){
        if(LOG)
            console.log(message);
    }

    return ({
        log : log
    })
}


exports = module.exports = Logger;