const jwt = require("jsonwebtoken");

const createJWT = (user_id, user_role) => {
    const payload = { user: { id: user_id, role: user_role } };
    return jwt.sign(payload, process.env.JWT_AUTH_TOKEN, { expiresIn: "1h" });
};

// const authMiddleware = expressJwt({
//     secret: process.env.JWT_SECRET,
//     algorithms: ['HS256'],
//     userProperty: 'auth' // Добавляем информацию о пользователе в req.auth
//   });

const auth = (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ message: "Нет токена, авторизация отменена" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_AUTH_TOKEN);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token error" });
    }
}

exports.createJWT = createJWT;
exports.auth = auth;