const mongoose = require("mongoose");
const tokenCrypto = require("../util/token-crypto.util");

const socialSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        platform: {
            type: String,
            required: true,
            enum: ["LinkedIn", "Instagram", "X"]
        },

         platformUserId: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true
        },

        
        accessToken: {
            type: String,
            required: true,
            set: tokenCrypto.encrypt,
            get: tokenCrypto.decrypt
        },

        refreshToken: {
            type: String,
            set: tokenCrypto.encrypt,
            get: tokenCrypto.decrypt
        },

        expiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Social", socialSchema);
