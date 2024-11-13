const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Необходима аутентификация' });
};

const hasRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        }
        res.status(403).json({ message: 'Доступ запрещен' });
    };
};

module.exports = { isAuthenticated, hasRole };