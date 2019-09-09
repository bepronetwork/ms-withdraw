var now = require("performance-now")
const Logger = require('./Logger');
const DEFAULT_DIFF = -1;

var Timer = () => {
    let start, end;

    async function run(object , fn, name, args=[]) {
        if(arguments.length < 3)
            throw new Error("Args not enough");

        start = now();
        let result = await object[fn](...args);
        end = now();
        return result;
    }

    async function runAndLog(object , fn, name, args=[]) {
        if(arguments.length < 3)
            throw new Error("Args not enough");

        start = now();
        let result = await object[fn](...args);
        end = now();
        Logger().log(`Function : ${name} took ${Math.abs(start-end).toFixed(2)/1000} s`)
        return result;
    }

    function getDate(diff=0){
        diff = (diff === 'TODAY') ? 0 : diff
        
        var theDay = new Date(new Date().setDate(new Date().getDate()+diff+DEFAULT_DIFF));

        var dd = theDay.getDate();
        var mm = theDay.getMonth() + 1; //January is 0!
        var yyyy = theDay.getFullYear();

        if(dd < 10) {
            dd = '0' + dd;
        }

        if(mm < 10) {
            mm = '0' + mm;
        }
        theDay = yyyy +  '-' + mm + '-' + dd;
        return theDay;
    }

    function Tomorrow(day){
        var ddd = (day.split(/-/)[1] + "/" + day.split(/-/)[2] + "/" + day.split(/-/)[0]);
        var date = new Date(ddd)
        date.setDate(date.getDate()+1);
        var dd = date.getDate();
        var mm = date.getMonth() + 1; //January is 0!
        var yyyy = date.getFullYear();
    
        if(dd < 10) {
            dd = '0' + dd;
        }
    
        if(mm < 10) {
            mm = '0' + mm;
        }
        date = yyyy +  '-' + mm + '-' + dd;
        return date;
    }

    return ({
        run : run,
        runAndLog : runAndLog,
        getDate : getDate,
        Tomorrow : Tomorrow
    })
}

exports = module.exports = Timer;