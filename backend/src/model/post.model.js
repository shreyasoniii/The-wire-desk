const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        topic: {
            type: String,
            required: true,
            trim: true
        },

        platform: {
            type: String,
            required: true,
            enum: ["LinkedIn", "Instagram", "X"]
        },

        tone: {
            type: String,
            required: true
        },

        audience: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["draft", "scheduled", "published"],
            default: "draft"
        },

        scheduledAt: {
            type: Date
        },

        
        autoRegenerate: {
            type: Boolean,
            default: false
        },

        
        usedFallback: {
            type: Boolean,
            default: false
        },

        publishedAt: {
            type: Date
        },

        
        mediaUrl: {
            type: String,
            trim: true
        },

        postedToRealPlatform: {
            type: Boolean,
            default: false
        },

        externalPostError: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);