
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

export function substituteString(modifiableString, key, value){
    if(!key || !value){ return }
    return modifiableString.replaceAll(`<${new String(key).toUpperCase().trim()}>`, value)
}
