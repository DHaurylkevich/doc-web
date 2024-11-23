require('dotenv').config();
const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const passport = require('passport');
const sessionConfig = require('./src/config/session');
const { errorHandler } = require("./src/middleware/errorHandler");
const AppError = require("./src/utils/appError");
const swaggerDocs = require("./src/utils/swagger");
const morgan = require("morgan");
const cors = require("cors");
const io = require("./src/controllers/websocketController");

require("./src/config/db");

app.use(cors({
  origin: [
    'https://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    "https://doc-web-rose.vercel.app",
    "https://mojlekarz.netlify.app",
    "https://stellar-proximal-handspring.glitch.me"
  ],
  credentials: true
}));
app.set('trust proxy', 1);

app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
io(server, sessionConfig, passport);
require('./src/config/passport');


app.use(express.json());
app.use(morgan("dev"));
swaggerDocs(app);

app.get('/auth/login', (req, res) => {
  res.send(`
    <form id="login-form">
  <div>
    <label>Email:</label>
    <input type="email" name="loginParam" value="admin@gmail.com" required>
  </div>
  <div>
    <label>Пароль:</label>
    <input type="password" name="password" value="123456789" required>      
  </div>
  <button type="submit">Войти</button>
</form>
<script>
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Остановить стандартное поведение формы
    const formData = new FormData(e.target);
    try {
      const response = await fetch('https://doc-web-rose.vercel.app/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginParam: formData.get('loginParam'),
          password: formData.get('password')
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Успешный вход:', data.message);
        console.log('Информация о пользователе:', data.user);
        // Вы можете использовать данные пользователя, например:
        // window.location.href = '/chat';
      } else {
        alert('Ошибка аутентификации');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  });
</script>
  `);
});

app.post('/auth/login', (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError(info.message || "Неверные учетные данные", 404));
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/chat');
    });
  })(req, res, next);
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get("/", (req, res) => { res.send("Hello"); })
app.use("/", require("./src/routes"));

app.use((req, res, next) => { next(new AppError("Not Found", 404)); });
app.use(errorHandler);

const port = process.env.PORT || 5000;
const link = process.env.LINK || "http://localhost";


server.listen(port, () => {
  console.log(`The server start at: ${link}:${port}`)
  console.log(`The documentation is available at: ${link}:${port}/api-docs`);
});

// module.exports = server;