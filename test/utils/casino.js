import MathSingleton from "./math";

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

        let resultSpaceArray = Object.keys(resultSpace).map( (key) => {
            let spaces = MathSingleton.toFloat(resultSpace[key].probability*100);
            let nextSpace = currentSpace+spaces;
            let res = {
                key     : resultSpace[key].formType,
                start   : parseFloat(currentSpace),
                end     : parseFloat(nextSpace),
                probability : resultSpace[key].probability,
                index   : key
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
            return parseInt(outcomeSpaceResult.index) == parseInt(resultBetted) ? acc+1 : acc;
        }, 0)

        return unit >= 1 ? true : false;
    }

    /**
     * 
     * @param {Float} betAmount 
     * @param {Int} houseEdge 
     */

    getRealOdd(betAmount, houseEdge=0){
        return MathSingleton.multiplyAbsolutes(betAmount, parseInt(houseEdge))/100;
    }

    /**
     * 
     * @param {Float} betAmount 
     * @param {Float} odd 
     * @param {Int} houseEdge 
     */

    calculateWinBalance(betAmount, userResultSpace, resultSpace, houseEdge){
        // TO DO : Check Errors in the Inputs (Positive, Negative, )
        /* Remove Duplicated Values from Odd Calculation */
        let spaceResultFinal = userResultSpace.reduce(function(a,b){
            if (a.indexOf(b) < 0 ) a.push(b);
            return a;
        },[]);
        
        /* Calculate Multipliers on Odd (Example Roulette) */
        let probability = spaceResultFinal.reduce( (acc, result) => {
            return acc+resultSpace[result].probability;
        }, 0);

        let odd = this.probabilityToOdd(probability)
        
        let winBalance = MathSingleton.multiplyAbsolutes(betAmount, odd)
        let houseEdgeBalance = this.getRealOdd(betAmount, houseEdge);
        return winBalance - houseEdgeBalance;
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