class Search {
    indexOfByObjectAddress(arrayObject, value) {
        console.log("arrayObject ", arrayObject);
        console.log("value ", value);
        for(let i in arrayObject) {
            if(arrayObject[i].addresses[0]==value){
                return i;
            }
        }
        return -1;
    }
}
let SearchSingleton = new Search();
export {SearchSingleton};