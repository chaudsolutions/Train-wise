const mongoose = require("mongoose");
const validator = require("validator");

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "creator", "user"],
            default: "user",
        },
        balance: { type: Number, default: 0 },
        stripeCustomerId: { type: String },
        activeSubscriptions: [
            {
                communityId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Community",
                },
                subscriptionId: { type: String }, // Stripe subscription ID
                status: {
                    type: String,
                    enum: ["active", "past_due", "canceled", "unpaid"],
                },
                currentPeriodEnd: { type: Date },
            },
        ],
        avatar: { type: String },
        onlineStatus: { type: Boolean, default: false },
        coursesWatched: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
                videos: [String],
            },
        ],
        allAccess: [
            {
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
    },
    { timestamps: true }
);

// Static sign up method and hashing password
UsersSchema.statics.signup = async function ({ email, name, password, role }) {
    console.log({ email, name, role, password });
    // validation
    if (!name || !email || !password) {
        throw Error("All Fields must be filled");
    } else if (password.length < 3) {
        throw Error("password too short");
    } else if (!validator.isEmail(email)) {
        throw Error("Not a valid Email");
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("User already exists");
    }

    const user = await this.create({
        name,
        email,
        role,
        password,
    });

    return user;
};

//static login method
UsersSchema.statics.login = async function ({ email, password }) {
    // validation
    if (!email || !password) {
        throw Error("All Fields must be filled");
    }

    // check is user exists
    const user = await this.findOne({ email });

    if (!user) {
        throw Error("User does not exist");
    }

    const match = password === user.password;
    if (!match) {
        throw Error("Incorrect password");
    }

    return user;
};

// Create Mongoose model
const UsersModel = mongoose.model(
    "User",
    UsersSchema.index({ onlineStatus: 1 })
);
module.exports = UsersModel;
