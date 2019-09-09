let config =  {
    0 : 'auto',
    1 : 'oracle'
}



function isCasino(betSystemNumber){
    return parseInt(betSystemNumber) == 0;
}

export {
    config, isCasino
};