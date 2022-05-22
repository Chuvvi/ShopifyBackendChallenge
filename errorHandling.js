const { ObjectId } = require('mongodb');

function checkStr(str, name){
    if(str === null || str === undefined) throw `${name} not provided`;
    if(typeof str !== 'string') throw `${name} is not a string`;
    str = str.trim();
    if(str.length === 0) throw `${name} is empty`;
    return str;
}

function checkNum(num, name, type){
    num = checkStr(num, name);
    if(type === 'float') num = parseFloat(num);
    else if(type === 'int'){
        if(num.includes('.')) throw `${name} cannot be a a decimal`;
        num = parseInt(num);
    }
    if(isNaN(num)) throw `${name} is not a number`;
    if(num <= 0) throw `${name} cannot be 0 or less`;
    return num;
}

function checkID(id){
    if(id === undefined || id === null) throw `ID not present`;
    checkStr(id);
    if(!ObjectId.isValid(id)) throw `Invalid ID`;
}

module.exports = {
    checkStr,
    checkNum,
    checkID
}