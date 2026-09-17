
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const userRoute = require("./route/user.route");
const aiRoute = require("./route/ai.route");
const postRoute = require("./route/post.route");
const socialRoute = require("./route/social.route");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// JSON body parser
app.use(express.json());

// Rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

// Routes
app.use("/api/users", authLimiter, userRoute);
app.use("/api/ai", aiRoute);
app.use("/api/posts", postRoute);
app.use("/api/social", socialRoute);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "AI Social Media Automation API is running"
    });
});

module.exports = app;

