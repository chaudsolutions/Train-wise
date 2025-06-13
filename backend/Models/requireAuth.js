const mongoose = require("mongoose");
const { verifyToken } = require("../utils/verifyJWT");

const requireAuth = async (req, res, next) => {
    //verify token
    const authHeader = req.headers.authorization;

    // Extract token from header
    if (!authHeader) {
        return res.status(401).send("Unauthorized: No token provided");
    }

    // Clean the token by removing quotes and trimming spaces
    let token = authHeader.split(" ")[1].trim();

    // Remove any leading or trailing quotes (e.g., if token is wrapped in quotes)
    if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    try {
        // Verify token synchronously
        const decoded = await verifyToken(token);

        const userId = mongoose.Types.ObjectId.createFromHexString(decoded._id);
        req.userId = userId;

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).send("Unauthorized: Invalid token");
    }
};

module.exports = requireAuth;
