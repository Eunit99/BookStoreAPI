var crypto = require('crypto');
var config = require('./config');

var helper = {};

helper.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

helper.parseJsonToObject = (str) => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

helper.generateRandomString = (stringLength) => {
    stringLength = typeof(stringLength) === 'number' ? stringLength : 20;
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (i = 0; i < stringLength; i++) {
        var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        str += randomChar;
    }
    return str;
}

helper.formatObject = (oldObject = {}, newObject = {}) => {
    let tempObj = {}
    Object.keys(newObject).map(key => {
        if (oldObject.hasOwnProperty(key)) {
            tempObj[key] = newObject[key];
        }
    })
    return {...oldObject, ...tempObj };
}

module.exports = helper;