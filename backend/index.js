const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { mongoUrl, serverPort } = require("./utils/variables");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
    })
);

const requireAuth = require("./Models/requireAuth");

// routes
const { Authentication } = require("./Routes/Authentication");
const { User } = require("./Routes/User");
const { Creator } = require("./Routes/Creator");
const { Api } = require("./Routes/Api");

//connect to DB
mongoose.connect(mongoUrl);
// Define a default route handler for the root URL ("/")
app.get("/", (req, res) => {
    res.send("Hello, World! This is the root route for TRAIN-WISE SERVERS.");
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

app.listen(serverPort, () => {
    console.log(`server is running on port ${serverPort}`);
});
