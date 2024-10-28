const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashingPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    console.log(password);
    const hash = await bcrypt.hash(password, salt);
    console.log("HASH", hash);
    return hash;
}

exports.checkingPassword = (password, hashPassword) => {
    const match = bcrypt.compare(password, hashPassword);
    if (!match) {
        throw new Error("Password Error");
    };
}
