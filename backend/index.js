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

//connect to DB
mongoose.connect(mongoUrl);
// Define a default route handler for the root URL ("/")
app.get("/", (req, res) => {
    res.send("Hello, World! This is the root route for TRAIN-WISE SERVERS.");
});

app.listen(serverPort, () => {
    console.log(`server is running on port ${serverPort}`);
});
