const ErrorLog = require("../Models/ErrorLog");

const errorLogger = async (error, req) => {
    try {
        await ErrorLog.create({
            timestamp: new Date(),
            userAgent: req.headers["user-agent"],
            type: "server",
            userId: req.userId,
            error: {
                name: error.name || "Error",
                message: error.message || "Internal Server Error",
                stack: error.stack,
            },
            context: {
                action: `${req.method} ${req.path}`,
                component: "ExpressServer",
                customData: { ip: req.ip, headers: req.headers },
            },
        });
    } catch (error) {
        console.error("Error logging error:", error);
    }
};

module.exports = { errorLogger };
