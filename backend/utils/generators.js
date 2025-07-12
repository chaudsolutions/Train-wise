const crypto = require("crypto");

const generateAlphanumericOTP = (length = 5) => {
    const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    const charactersLength = characters.length;
    const randomBytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters[randomBytes[i] % charactersLength];
    }

    return result;
};

module.exports = { generateAlphanumericOTP };
