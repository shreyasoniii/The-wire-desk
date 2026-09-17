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

        // AI generation credits. Decremented by 1 each time the AI is
        // actually called (ai.controller / scheduler.service). When this
        // hits 0, callers fall back to template-based content instead of
        // failing the request.
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
