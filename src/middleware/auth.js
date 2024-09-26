const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const token = req.header("x-auth-token");

    if(!token) { 
        return res.status(401).json({ message: "Нет токена, авторизация отменена" });
    }

    try {
        const decoded = jwt.decode(token, process.env.jwt_secret);
        req.user = decoded.user;
        next();
    }catch (err) {
        res.status(401).json({ message : err.message });
    }
}