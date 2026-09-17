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

        // If true, the scheduler tries to regenerate this post's content
        // with AI right before publishing (falling back to template
        // content automatically if credits are unavailable).
        autoRegenerate: {
            type: Boolean,
            default: false
        },

        // True if the content currently on this post came from the
        // template fallback rather than the AI, so the UI can flag it
        // for review.
        usedFallback: {
            type: Boolean,
            default: false
        },

        publishedAt: {
            type: Date
        },

        // A publicly reachable image/video URL. Optional for LinkedIn/X,
        // but required if this post is ever actually published to
        // Instagram — its API has no text-only post type.
        mediaUrl: {
            type: String,
            trim: true
        },

        // Whether publishing actually reached the real platform (true) vs.
        // only being recorded in-app because no account was connected or
        // the platform integration isn't live yet (false).
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