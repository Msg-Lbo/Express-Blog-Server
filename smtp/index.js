const nodemailer = require('nodemailer');
const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PORT, EMAIL_PASS } = process.env
const nodeMail = nodemailer.createTransport({
    host: EMAIL_SERVICE,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

module.exports = nodeMail