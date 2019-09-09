import Numbers from "../logic/services/numbers";

class math{
    constructor(){}

    multiplyAbsolutes(...args){
        return args.reduce((acc, arg) => {
            return acc*this.toFloat(arg);
        }, 1);
    }

    toFloat(number){
        return parseFloat(parseFloat(Math.abs(number)).toFixed(2));
    }
}

let MathSingleton = new math();

export default MathSingleton;



function getRandom(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomBetResult({game, betAmount}){
    var indexes = [];
    var availableAmount = Numbers.toFloat(betAmount);
    var cycle = getRandom(1, game.resultSpace.length-1);
    for(var i = 0; i < cycle; i++){
        if(i == 0){
            let betAmountLocal = betAmount/2;
            availableAmount = parseFloat(availableAmount) - parseFloat(betAmountLocal);
            indexes.push({
                place : getRandom(0, game.resultSpace.length-1),
                value : betAmountLocal
            })
        }
        else if(i == (cycle-1)){
            // Last cycle
            if(availableAmount > 0){
                indexes.push({
                    place : getRandom(0, game.resultSpace.length-1),
                    value : availableAmount
                })
            }
        }else{
            let betAmountLocal = getRandom(0.01, availableAmount);
            availableAmount = parseFloat(availableAmount) - parseFloat(betAmountLocal);
            if(availableAmount > 0 && betAmountLocal <= availableAmount){
                indexes.push({
                    place : getRandom(0, game.resultSpace.length-1),
                    value : betAmountLocal
                })
            }
          
        }
    } 
    return indexes;
}

export {
    getRandomBetResult,
    getRandom
}