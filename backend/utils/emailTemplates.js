const { appUrl } = require("./variables");

const baseEmailTemplate = (title, content, note) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Base styles */
        .email-container { 
            max-width: 600px;
            margin: 0 auto;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            padding: 0.5rem;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #eeeeee;
            margin-bottom: 1rem;
        }
        .header h1 {
            font-size: 1.5rem;
            margin: 0;
        }
        .logo {
            height: 5rem;
            object-fit: contain;
            margin-bottom: 5px;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            color: #666666;
            font-size: 0.9em;
            border-top: 2px solid #eeeeee;
        }
        .note {
            color: #666666;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="${appUrl}/logo.png" alt="Company Logo" class="logo">
            <h1>${title}</h1>
        </div>
        
        <div class="content">
            ${content}
            ${note ? `<p class="note">${note}</p>` : ""}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Skillbay. All rights reserved.</p>
            <p>Built with passion in 2025</p>
            <p>Need help? <a href="mailto:support@${appUrl}">Contact our support team</a></p>
        </div>
    </div>
</body>
</html>
`;

// Password Reset Email
exports.passwordResetOTPEmail = (otpCode) => {
    const subject = "Your Password Reset OTP";
    const content = `
        <p>We received a request to reset your password. Use the following OTP to verify your identity:</p>
        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #2c3e50;
            background-color: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 25px 0;
            display: inline-block;
            font-family: monospace;
        ">
            ${otpCode}
        </div>
        <p>This OTP is valid for 2 hrs. Do not share this code with anyone.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
    `;
    const note =
        "Note: This code contains both letters and numbers, and is case-sensitive.";

    return {
        subject,
        html: baseEmailTemplate(subject, content, note),
        text: `Your Password Reset OTP: ${otpCode}\nThis code expires in 2hrs. Do not share it.`,
    };
};

// Welcome Email
exports.welcomeEmail = (userName) => {
    const subject = `Welcome to Our Service, ${userName}!`;
    const content = `
        <p>Thank you for joining our platform!</p>
        <p>Get started by exploring our features:</p>
        <a href="${appUrl}/profile" class="button">Go to Profile</a>
        <p>Need help getting started? Check out our <a href="${appUrl}/tutorial">getting started guides</a>.</p>
    `;

    return {
        subject,
        html: baseEmailTemplate(subject, content),
        text: `Welcome to Our Service!\n\nGet started: https://yourdomain.com/dashboard`,
    };
};

// Welcome Email with Verification OTP
exports.welcomeEmailWithOTP = (userName, otpCode) => {
    const subject = `Welcome to Skillbay, ${userName}!`;
    const content = `
        <p>Thank you for joining Skillbay! To get started, please verify your account using this OTP:</p>
        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #2c3e50;
            background-color: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 25px 0;
            display: inline-block;
            font-family: monospace;
        ">
            ${otpCode}
        </div>
        <p>This OTP is valid for 24 hours. Do not share this code with anyone.</p>
        <p>Once verified, you can start exploring our platform:</p>
        <a href="${appUrl}/profile" class="button">Go to Profile</a>
    `;
    const note =
        "Note: This code contains both letters and numbers, and is case-sensitive.";

    return {
        subject,
        html: baseEmailTemplate(subject, content, note),
        text: `Welcome to Skillbay!\n\nYour verification OTP: ${otpCode}\nThis code expires in 24hrs. Do not share it.\n\nGet started: ${appUrl}/profile`,
    };
};
