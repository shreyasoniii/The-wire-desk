const postService = require("../service/post.service");

const createPost = async (req, res) => {
    try {

        const {
            topic,
            platform,
            tone,
            audience,
            content,
            mediaUrl
        } = req.body;

        // Validation
        if (!topic || !platform || !tone || !audience || !content) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Call service
        const post = await postService.createPost({
            userId: req.userId,
            topic,
            platform,
            tone,
            audience,
            mediaUrl,
            content
        });

        return res.status(201).json({
            success: true,
            message: "Post saved successfully",
            data: post
        });

    } catch (error) {

        console.error("Create post error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPosts(req.userId);

        return res.status(200).json({
            success: true,
            data: posts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getPostById = async (req, res) => {

    try {

        const { id } = req.params;


        const post = await postService.getPostById(
            req.userId,
            id
        );


        return res.status(200).json({
            success: true,
            data: post
        });


    } catch (error) {

        console.error("Get single post error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};



// UPDATE POST
const updatePost = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            topic,
            platform,
            tone,
            audience,
            content,
            status
        } = req.body;


        const updates = {
            topic,
            platform,
            tone,
            audience,
            content,
            status
        };


        const updatedPost = await postService.updatePost(
            req.userId,
            id,
            updates
        );


        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost
        });


    } catch (error) {

        console.error("Update post error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};



// DELETE POST
const deletePost = async (req, res) => {

    try {

        const { id } = req.params;


        await postService.deletePost(
            req.userId,
            id
        );


        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });


    } catch (error) {

        console.error("Delete post error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// SCHEDULE POST
const schedulePost = async (req, res) => {

    try {

        const { id } = req.params;
        const { scheduledAt, autoRegenerate } = req.body;

        const post = await postService.schedulePost(
            req.userId,
            id,
            { scheduledAt, autoRegenerate }
        );

        return res.status(200).json({
            success: true,
            message: "Post scheduled successfully",
            data: post
        });

    } catch (error) {

        console.error("Schedule post error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// PUBLISH POST NOW
const publishPost = async (req, res) => {

    try {

        const { id } = req.params;
        const { mediaUrl } = req.body;

        const post = await postService.publishPost(
            req.userId,
            id,
            { mediaUrl }
        );

        return res.status(200).json({
            success: true,
            message: "Post published successfully",
            data: post
        });

    } catch (error) {

        console.error("Publish post error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    schedulePost,
    publishPost
};