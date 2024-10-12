const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashingPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

exports.checkingPassword = function (password, hashPassword) {
    const match = bcrypt.match(password, hashPassword);
    if (!match){
        throw new Error("Password Error");
    };
}
