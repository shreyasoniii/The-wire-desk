const mongoose = require("mongoose");

const DEFAULT_MONTHLY_CREDITS = 20;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            trim: true
        },

        credits: {
            type: Number,
            default: DEFAULT_MONTHLY_CREDITS
        },

        monthlyCreditAllowance: {
            type: Number,
            default: DEFAULT_MONTHLY_CREDITS
        },

        lastCreditRefill: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

userSchema.statics.DEFAULT_MONTHLY_CREDITS = DEFAULT_MONTHLY_CREDITS;

const User = mongoose.model("User", userSchema);

module.exports = User;
