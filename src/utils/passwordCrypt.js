const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.hashingPassword = async function (password) {
    try{
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (err) {
        console.error('Error hashing password:', err);
        return err;
    }
}

exports.checkingPassword = async function (password, hashPassword) {
    try{
        const match = await bcrypt.match(password, hashPassword);
        return match;
    } catch (err) {
        console.error('Error hashing password:', err);
        return err;
    }
}