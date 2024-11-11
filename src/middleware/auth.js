const jwt = require("jsonwebtoken");
const { expressjwt } = require('express-jwt');

const createJWT = (user_id, user_role) => {
    const payload = { id: user_id, role: user_role };
    return jwt.sign(payload, process.env.JWT_AUTH_TOKEN, { expiresIn: "1h" });
};

const authMiddleware = expressjwt({
    secret: process.env.JWT_AUTH_TOKEN,
    algorithms: ['HS256'],
    getToken: (req) => req.cookies.token,
});

// const auth = (req, res, next) => {
//     const token = req.header("x-auth-token");

//     if (!token) {
//         return res.status(401).json({ message: "Нет токена, авторизация отменена" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_AUTH_TOKEN);
//         req.user = decoded.user;
//         next();
//     } catch (err) {
//         res.status(401).json({ message: "Token error" });
//     }
// }

exports.createJWT = createJWT;
exports.auth = authMiddleware;