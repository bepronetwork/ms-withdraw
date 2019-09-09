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