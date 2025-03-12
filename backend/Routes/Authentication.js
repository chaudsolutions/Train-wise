const express = require("express");
const jwt = require("jsonwebtoken");

const UsersModel = require("../Models/Users.js");

const router = express.Router();
const secretKey = process.env.SECRET;

// jwt token
const createToken = (_id) => {
    return jwt.sign({ _id }, secretKey);
};

// server sign up handle signUp
router.post("/register", async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Register a new user
        const user = await UsersModel.signup({ email, name, password });

        // Create a token for the user
        const token = createToken(user._id);

        // Send the token as a response
        res.status(200).json(token);
    } catch (error) {
        res.status(400).send(
            error?.message || "Registration failed, please try again."
        );
        console.error(error);
    }
});

// server login handle
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UsersModel.login({ email, password });

        //create a token
        const token = createToken(user._id);

        res.status(200).send(token);
    } catch (error) {
        res.status(400).send(error?.message);
    }
});

module.exports = { Authentication: router };
