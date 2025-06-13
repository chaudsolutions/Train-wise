const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const { mongoUrl, serverPort, allowedOrigins } = require("./utils/variables");

const app = express();
app.use(morgan("tiny"));
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "HEAD", "PUT", "PATCH", "OPTIONS", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        optionsSuccessStatus: 204,
    })
);

const requireAuth = require("./Models/requireAuth");

// routes
const { Authentication } = require("./Routes/Authentication");
const { User } = require("./Routes/User");
const { Creator } = require("./Routes/Creator");
const { Api } = require("./Routes/Api");
const { VerifyPayments } = require("./Routes/VerifyPayments");
const { Admin } = require("./Routes/Admin");

//connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45s inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Event listeners
        mongoose.connection.on("error", (err) => {
            console.error("DB connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed through app termination");
            process.exit(0);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};

// Usage
connectDB();

// Define a default route handler for the root URL ("/")
app.get("/", (req, res) => {
    res.send("Hello, World! This is the root route for SKILLBAY SERVERS.");
});

// authentication route
app.use("/api", Api);

// authentication route
app.use("/auth", Authentication);

// user route
app.use("/user", requireAuth);
app.use("/user", User);

// user route
app.use("/creator", requireAuth);
app.use("/creator", Creator);

// user route
app.use("/admin", requireAuth);
app.use("/admin", Admin);

// Use payments verification route
app.use("/payment", requireAuth);
app.use("/payment", VerifyPayments);

app.listen(serverPort, () => {
    console.log(`server is running on port ${serverPort}`);
});
