const session = require('express-session');
const sessionStore = require('./store');

const sessionConfig = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        // sameSite: process.env.NODE_ENV === 'production' ? 'None' : "Lax",
        sameSite: "Lax",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
});

module.exports = sessionConfig;
