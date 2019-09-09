import { substituteString } from "./string";

export function changeAllStringsInObjectRecursive(obj, key, value) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                changeAllStringsInObjectRecursive(obj[property], key, value);
            }
            else if(typeof obj[property] == "string") {
                obj[property] = substituteString(obj[property], key, value);
            } else {
            } 
        }
    }

    return obj;
}