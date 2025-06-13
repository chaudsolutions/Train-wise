// define all variables and constants here and export

// app constants
// mailer
const appUrl = "https://skillbay.net";
const fromMail = `SKILLBAY <noreply@${appUrl}>`;
const replyToMail = `noreply@${appUrl}`;
// server
const serverPort = process.env.port;
// db
const mongoUrl = process.env.mongodbLive;
// secret key
const secretKey = process.env.SECRET;
// allowed origins
const allowedOrigins = [
    process.env.CLIENT_URL_PROD,
    process.env.CLIENT_URL_VERCEL,
];

module.exports = {
    appUrl,
    fromMail,
    replyToMail,
    serverPort,
    mongoUrl,
    secretKey,
    allowedOrigins,
};
