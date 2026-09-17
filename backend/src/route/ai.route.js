const express = require("express");

const aiController = require("../controller/ai.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/generate", protect, aiController.generatePost);

module.exports = router;