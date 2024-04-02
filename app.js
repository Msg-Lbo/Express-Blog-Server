const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const app = express();
const host = '127.0.0.1'
const port = '9090'

const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:3000', 'http://192.168.2.22:3000'],
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
    secret: 'CNMB@!#3+2-5dy0',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: false }
}))


app.use('/api/v1', require('./router'))

app.listen(port, host, () => {
    console.log(`Server is running at ${host}:${port}`);
});