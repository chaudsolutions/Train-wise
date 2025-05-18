const crypto = require("crypto");

const generateAlphanumericOTP = (length = 6) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    const randomBytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters[randomBytes[i] % charactersLength];
    }

    return result;
};

module.exports = { generateAlphanumericOTP };
