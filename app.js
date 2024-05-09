const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const dotenv = require("dotenv")
dotenv.config()
const { HOST, PORT, SESSION_SECRET } = process.env

const app = express();

const corsOptions = {
    origin: ['https://blog.ylmty.cc', 'http://127.0.0.1:5173', 'http://localhost:5173', 'http://192.168.31.20:5173'],
    methods: 'GET,POST',
    allowHeaders: 'Content-Type,Authorization',
    exposeHeaders: 'Content-length',
    credentials: true,
}


app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
const upload = multer({
    dest: './public/uploads/temp',
});
app.use(upload.any());
app.use(express.static('./public'));
app.use(cookieParser());
app.use(session({
    secret: SESSION_SECRET, // 用来对 session id 进行签名
    resave: false, // 是否每次都重新保存 session
    saveUninitialized: true, // 是否自动保存未初始化的 session
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        // sameSite: 'none',
        // secure: true,
    }
}))

app.use('/api/v1', require('./router'))

app.listen(PORT, HOST, () => {
    console.log(`Server is running at ${HOST}:${PORT}`);
});