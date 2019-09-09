import MathSingleton from "./math";
import Numbers from "../services/numbers";
import { throwError } from "../../controllers/Errors/ErrorManager";

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

class CasinoLogic{

    constructor(){}

    /**
     * @function
     * @param {*} outcome 
     * @param {*} resultSpace 
     * 
     */

    fromOutcometoResultSpace(outcome, resultSpace){
        let currentSpace = 0;
        let res;
        let resultSpaceArray = resultSpace.map( (item, index) => {
            let spaces = MathSingleton.toFloat(item.probability*100);
            let nextSpace = currentSpace+spaces;
            let res = {
                key     : item.formType,
                start   : parseFloat(parseFloat(currentSpace).toFixed(6)),
                end     : parseFloat(parseFloat(nextSpace).toFixed(6)),
                probability : item.probability,
                index 
            }
            currentSpace = nextSpace;
            return res;
        })

        resultSpaceArray.map( (item) => {
            if(outcome >= item.start && outcome < item.end){
                res = item;
            }
        })

        return res;
    }
    
    /**
     * 
     * @param {Int} outcomeSpaceResult 
     * @param {fromOutcometoResultSpace} userResultSpace 
     */

    isWon(outcomeSpaceResult, userResultSpace){
        let unit =  userResultSpace.reduce( (acc, resultBetted) => {
            return parseInt(outcomeSpaceResult.index) == parseInt(resultBetted.place) ? acc+1 : acc;
        }, 0)

        return unit >= 1 ? true : false;
    }

    /**
     * 
     * @param {Float} betAmount 
     * @param {Int} houseEdge 
     */

    getRealOdd(betAmount, houseEdge=0){
        return Numbers.toFloat(MathSingleton.multiplyAbsolutes(betAmount, parseInt(houseEdge))/100);
    }


    normalizeBet(userResultSpace){
        try{
            // TO DO : Check Errors in the Inputs (Positive, Negative, )
            /* Remove Duplicated Values from Odd Calculation */
            return userResultSpace.reduce( (array , item) => {
                if (findWithAttr(array, 'place', item.place) < 0 ){
                    if(typeof item.value != 'number'){throwError('BAD_BET')}
                    if(item.value <= 0){ throwError('BAD_BET')}
                    array.push({
                        place : item.place,
                        value : Numbers.toFormatBet(item.value)
                    });
                } 
                return array;
            },[]);
        }catch(err){
            throw err;
        }
            
    }

    /**
     * 
     * @param {Float} betAmount 
     * @param {Float} odd 
     * @param {Int} houseEdge 
     */

    calculateWinAmountWithOutcome({userResultSpace, resultSpace, houseEdge, outcomeResultSpace, game}){
        try{
            var winAmount, totalBetAmount, isWon, maxWin;

            switch(game){
                case 'european_roulette_simple' : {
                    var el = userResultSpace.find( object => parseInt(object.place) == parseInt(outcomeResultSpace.key));
                    if(!el){
                        // Lost
                        isWon = false;
                        winAmount = 0
                    }else{
                        isWon = true;
                        let probability = resultSpace[el.place].probability;
                        maxWin = parseFloat(el.value)/parseFloat(probability);
                        /* Default Logic */
                        let houseEdgeBalance = this.getRealOdd(maxWin, houseEdge);
                        winAmount = Numbers.toFloat(maxWin - houseEdgeBalance);
                    }   
                    break;
                };
                case 'coinflip_simple' : {
                    var el = userResultSpace.find( object => parseInt(object.place) == parseInt(outcomeResultSpace.index));
                    if(!el){
                        // Lost
                        winAmount = 0
                        isWon = false;
                    }else{
                        isWon = true;
                        let probability = resultSpace[el.place].probability;
                        maxWin = parseFloat(el.value)/parseFloat(probability);
                        /* Default Logic */
                        let houseEdgeBalance = this.getRealOdd(maxWin, houseEdge);
                        winAmount = Numbers.toFloat(maxWin - houseEdgeBalance);
                    }   
                    break;
                };
                case 'linear_dice_simple' : {
                    var el = userResultSpace.find( object => parseInt(object.place) == parseInt(outcomeResultSpace.index));
                    if(!el){
                        // Lost
                        isWon = false;
                        winAmount = 0
                    }else{
                        isWon = true;
                        let probability = userResultSpace.reduce( (acc, result) => {
                            return acc+resultSpace[result.place].probability;
                        }, 0);
                        let odd = Numbers.toFloat(this.probabilityToOdd(probability));
                        totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                            if(item.value <= 0){ throw throwError('BAD_BET')}
                            return acc+item.value;
                        }, 0))
                        maxWin = MathSingleton.multiplyAbsolutes(totalBetAmount, odd);
                        /* Default Logic */
                        let houseEdgeBalance = this.getRealOdd(maxWin, houseEdge);
                        winAmount = Numbers.toFloat(maxWin - houseEdgeBalance);
                    }  
                    break;
                };
                case 'jackpot_auto' : {
                    var el = userResultSpace.find( object => parseInt(object.place) == parseInt(outcomeResultSpace.index));
                    if(!el){
                        // Lost
                        isWon = false;
                        winAmount = 0
                    }else{
                        isWon = true;
                        let probability = userResultSpace.reduce( (acc, result) => {
                            return acc+resultSpace[result.place].probability;
                        }, 0);
                        let odd = Numbers.toFloat(this.probabilityToOdd(probability));
                        totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                            if(item.value <= 0){ throw throwError('BAD_BET')}
                            return acc+item.value;
                        }, 0))
                        maxWin = MathSingleton.multiplyAbsolutes(totalBetAmount, odd);
                        /* Default Logic */
                        let houseEdgeBalance = this.getRealOdd(maxWin, houseEdge);
                        winAmount = Numbers.toFloat(maxWin - houseEdgeBalance);
                    }  
                    break;
                };
                default : { 
                    throw new Error('Internal Server Error')
                }
            }


            return {
                winAmount : Numbers.toFloat(winAmount),
                totalBetAmount : Numbers.toFloat(totalBetAmount),
                isWon
            }
        }catch(err){
            throw err;
        }
    }

    /**
     * 
     * @param {Float} betAmount 
     * @param {Float} odd 
     * @param {Int} houseEdge 
     */

    calculateMaxWinAmount({userResultSpace, resultSpace, houseEdge, game}){

        try{
            var winAmount, totalBetAmount;

            switch(game){
                case 'european_roulette_simple' : {
                    /* Calculate Multipliers on Odd (Example Roulette) */
                    let { maxWin, probability, place, value } = userResultSpace.reduce( (object, result) => {
                        let probability = resultSpace[result.place].probability;
                        let maxWin = parseFloat(result.value)/parseFloat(probability);
                        if(maxWin > object.maxWin){
                            return {maxWin, probability, place : result.place, value : result.value};
                        }else{
                            return object;
                        }
                    }, {maxWin : 0, probability : 0, place : 0, value : 0});
                    totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                        if(typeof item.value != 'number'){ throwError('BAD_BET')}
                        if(item.value <= 0){ throw throwError('BAD_BET')}
                        return acc+item.value;
                    }, 0))
                    let houseEdgeBalance = this.getRealOdd(maxWin, houseEdge);
                    winAmount = Numbers.toFloat(maxWin - houseEdgeBalance);
                    break;
                };
                case 'coinflip_simple' : {
                    /* Calculate Multipliers on Odd (Example Roulette) */
                    let probability = userResultSpace.reduce( (acc, result) => {
                        return acc+resultSpace[result.place].probability;
                    }, 0);
                    let odd = Numbers.toFloat(this.probabilityToOdd(probability));
                    // ERROR : More than 1 
                    if(userResultSpace.length != 1){ throw throwError('BAD_BET')}
                    totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                        if(typeof item.value != 'number'){ throwError('BAD_BET')}
                        if(item.value <= 0){ throw throwError('BAD_BET')}
                        return acc+item.value;
                    }, 0))
                    let winBalance = MathSingleton.multiplyAbsolutes(totalBetAmount, odd);
                    let houseEdgeBalance = this.getRealOdd(totalBetAmount, houseEdge);
                    winAmount = Numbers.toFloat(winBalance - houseEdgeBalance);
                    break;
                };
                case 'linear_dice_simple' : {
                    /* Calculate Multipliers on Odd (Example Roulette) */
                    let probability = userResultSpace.reduce( (acc, result) => {
                        return acc+resultSpace[result.place].probability;
                    }, 0);
                    let odd = Numbers.toFloat(this.probabilityToOdd(probability));
                    totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                        if(typeof item.value != 'number'){ throwError('BAD_BET')}
                        if(item.value <= 0){ throw throwError('BAD_BET')}
                        return acc+item.value;
                    }, 0))
                    let winBalance = MathSingleton.multiplyAbsolutes(totalBetAmount, odd);
                    let houseEdgeBalance = this.getRealOdd(totalBetAmount, houseEdge);
                    winAmount = Numbers.toFloat(winBalance - houseEdgeBalance);
                    break;
                };
                case 'jackpot_auto' : {
                    /* Calculate Multipliers on Odd (Example Roulette) */
                    let probability = userResultSpace.reduce( (acc, result) => {
                        return acc+resultSpace[result.place].probability;
                    }, 0);
                    let odd = Numbers.toFloat(this.probabilityToOdd(probability));
                    totalBetAmount = Numbers.toFormatBet(userResultSpace.reduce( (acc, item) => {
                        if(typeof item.value != 'number'){ throwError('BAD_BET')}
                        if(item.value <= 0){ throw throwError('BAD_BET')}
                        return acc+item.value;
                    }, 0))
                    let winBalance = MathSingleton.multiplyAbsolutes(totalBetAmount, odd);
                    let houseEdgeBalance = this.getRealOdd(totalBetAmount, houseEdge);
                    winAmount = Numbers.toFloat(winBalance - houseEdgeBalance);
                    break;
                };
                default : { 
                    throw new Error('Internal Server Error')
                }
            }
            return {
                possibleWinAmount : winAmount, 
                fee : Numbers.toFloat(Numbers.toFloat(totalBetAmount)*houseEdge/100),
                totalBetAmount : Numbers.toFloat(totalBetAmount)
            }
        }catch(err){
            throw err;
        }
    }

    /**
     * 
     * @param {Float} probability 
     */

    probabilityToOdd(probability){
        return 1/MathSingleton.toFloat(probability);
    }
}



let CasinoLogicSingleton = new CasinoLogic();

export default CasinoLogicSingleton;