const jwt = require("jsonwebtoken");
const { secretKey } = require("./variables");

// Verify token synchronously
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return err;
    }
};

module.exports = { verifyToken };
