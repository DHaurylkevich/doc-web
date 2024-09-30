const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashingPassword = function (password) {
    const salt = bcrypt.genSalt(saltRounds);
    const hash = bcrypt.hash(password, salt);
    return hash;
}

exports.checkingPassword = function (password, hashPassword) {
    const match = bcrypt.match(password, hashPassword);
    return match;
}
