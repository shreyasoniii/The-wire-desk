const Post = require("../model/post.model");
const socialPublisher = require("./social-publisher.service");

const createPost = async ({
    userId,
    topic,
    platform,
    tone,
    audience,
    content,
    mediaUrl
}) => {

    const post = await Post.create({
        user: userId,
        topic,
        platform,
        tone,
        audience,
        content,
        mediaUrl
    });

    return post;
};

const getAllPosts = async (userId) => {
    return Post.find({ user: userId }).sort({ createdAt: -1 });
};

const getPostById = async (userId, id) => {
    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

const updatePost = async (userId, id, updates) => {
    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
        throw new Error("Post not found");
    }

    const allowedFields = ["topic", "platform", "tone", "audience", "content", "status", "mediaUrl"];

    allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
            post[field] = updates[field];
        }
    });

    await post.save();

    return post;
};

const deletePost = async (userId, id) => {
    const post = await Post.findOneAndDelete({ _id: id, user: userId });

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

// Marks a post to be auto-published at scheduledAt. If autoRegenerate is
// true, the scheduler will try to refresh the content with AI right
// before publishing (falling back to template content if credits are
// unavailable at that time).
const schedulePost = async (userId, id, { scheduledAt, autoRegenerate }) => {
    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
        throw new Error("Post not found");
    }

    if (!scheduledAt) {
        throw new Error("scheduledAt is required");
    }

    const when = new Date(scheduledAt);

    if (Number.isNaN(when.getTime())) {
        throw new Error("Invalid scheduledAt date");
    }

    post.scheduledAt = when;
    post.autoRegenerate = !!autoRegenerate;
    post.status = "scheduled";

    await post.save();

    return post;
};

// Publishes a post immediately with whatever content it currently has
// (used for the manual "Publish now" action, as opposed to the
// scheduler's automatic publish of due posts). Tries to actually send it
// to the connected account for the post's platform; if there's no
// connected account, or that platform integration isn't live, the post
// is still marked published in-app but flagged as not having gone out
// for real (see postedToRealPlatform / externalPostError).
const publishPost = async (userId, id, { mediaUrl } = {}) => {
    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
        throw new Error("Post not found");
    }

    // A mediaUrl passed in at publish time (e.g. from the "Publish now"
    // dialog) overrides whatever was saved on the post, but falls back
    // to the post's own mediaUrl if none was given.
    if (mediaUrl !== undefined) {
        post.mediaUrl = mediaUrl;
    }

    const result = await socialPublisher.publishToPlatform({
        userId,
        platform: post.platform,
        content: post.content,
        mediaUrl: post.mediaUrl
    });

    post.status = "published";
    post.publishedAt = new Date();
    post.postedToRealPlatform = result.posted;
    post.externalPostError = result.posted ? undefined : result.reason;

    await post.save();

    return post;
};

// Used by the scheduler (not user-scoped) to find every post across all
// users whose scheduled time has passed and is still waiting to publish.
const getDuePosts = async () => {
    return Post.find({
        status: "scheduled",
        scheduledAt: { $lte: new Date() }
    });
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    getDuePosts
};
