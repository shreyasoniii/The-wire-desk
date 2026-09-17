const express = require("express");
const postController = require("../controller/post.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Every post route is scoped to the logged-in user.
router.use(protect);

router.get("/", postController.getAllPosts);
router.post("/", postController.createPost);

router.get("/:id", postController.getPostById);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

router.post("/:id/schedule", postController.schedulePost);
router.post("/:id/publish", postController.publishPost);

module.exports = router;
