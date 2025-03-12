// define all variables and constants here and export

// app constants
// mailer
const appUrl = "";
const fromMail = `TRAIN-WISE <noreply@trainwise.com>`;
const replyToMail = `noreply@trainwise.com`;
// server
const serverPort = process.env.port;
// db
const mongoUrl = process.env.mongodbLive;

module.exports = {
    appUrl,
    fromMail,
    replyToMail,
    serverPort,
    mongoUrl,
};
