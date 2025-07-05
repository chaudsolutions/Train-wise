const nodemailer = require("nodemailer");

// mailer
const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SECRET_USER,
        pass: process.env.SECRET_PASSWORD,
    },
});

module.exports = transporter;
