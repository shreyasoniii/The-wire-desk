const express = require("express");
const socialController = require("../controller/social.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Manual/advanced: paste in a token you already generated yourself.
router.post("/connect", protect, socialController.connect);
router.get("/", protect, socialController.getAll);
router.delete("/:id", protect, socialController.disconnect);


router.get("/linkedin/connect", protect, socialController.linkedinConnect);
router.get("/linkedin/callback", socialController.linkedinCallback);

router.get("/x/connect", protect, socialController.xConnect);
router.get("/x/callback", socialController.xCallback);

router.get("/instagram/connect", protect, socialController.instagramConnect);
router.get("/instagram/callback", socialController.instagramCallback);

module.exports = router;
