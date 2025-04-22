const Notification = require("../Models/Notification");

const createNotification = async (userId, message) => {
    try {
        await Notification.create({
            userId,
            message,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

module.exports = { createNotification };
