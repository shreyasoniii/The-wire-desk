const express = require("express");

const userController = require("../controller/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.get("/credits", protect, userController.getCredits);

module.exports = router;