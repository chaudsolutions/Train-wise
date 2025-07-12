const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UsersModel = require("../Models/Users.js");
const { generateAlphanumericOTP } = require("../utils/generators.js");
const {
    passwordResetOTPEmail,
    welcomeEmailWithOTP,
} = require("../utils/emailTemplates.js");
const transporter = require("../config/nodemailer.js");

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
        // Generate verification OTP and expiry (24 hours from now)
        const verificationOTP = generateAlphanumericOTP();
        const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Register a new user
        const user = await UsersModel.signup({
            email,
            name,
            password,
            verificationOTP,
            verificationExpiry,
            isVerified: false,
        });

        // Send welcome email with verification OTP
        const emailContent = welcomeEmailWithOTP(name, verificationOTP);
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            replyTo: process.env.EMAIL_REPLY_TO,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        };

        await transporter.sendMail(mailOptions);

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

// password reset endpoint
router.post("/reset-password/email", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UsersModel.findOne({ email });

        if (!user) {
            return res.status(404).json("User not found");
        }

        // Generate alphanumeric OTP and expiration
        const otp = generateAlphanumericOTP(); // 6-character code
        const otpExpiry = Date.now() + 7200000; // 2hrs

        // Save OTP to user document
        user.passwordResetOTP = otp;
        user.passwordResetExpiry = otpExpiry;
        await user.save();

        // Send email with OTP
        const emailContent = passwordResetOTPEmail(otp);
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            replyTo: process.env.EMAIL_REPLY_TO,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json("OTP sent successfully");
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json("Failed to reset password");
    }
});

// endpoint to verify user OTP
router.post("/reset-password/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await UsersModel.findOne({
            email,
            passwordResetExpiry: { $gt: Date.now() },
        });

        if (
            !user ||
            user.passwordResetOTP.toUpperCase() !== otp.toUpperCase()
        ) {
            return res.status(400).json("Invalid or expired verification code");
        }

        res.status(200).json("OTP verified successfully");
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json("Failed to verify OTP");
    }
});

// endpoint to update password
router.post("/reset-password/new-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json("All fields are required");
    }

    try {
        // 1. Find user with matching email and valid OTP
        const user = await UsersModel.findOne({
            email,
            passwordResetOTP: otp,
            passwordResetExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json("Invalid OTP or expired");
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update user document
        user.password = hashedPassword;
        user.passwordResetOTP = undefined;
        user.passwordResetExpiry = undefined;

        await user.save();

        // 4. Send success response
        res.status(200).json("Password updated successfully");
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json("Error resetting password");
    }
});

module.exports = { Authentication: router };
