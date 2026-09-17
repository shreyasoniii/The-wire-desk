const postService = require("./post.service");
const userService = require("./user.service");
const aiService = require("./ai.service");
const socialPublisher = require("./social-publisher.service");

const CHECK_INTERVAL_MS = 60 * 1000; // check for due posts once a minute

// Publishes every scheduled post whose scheduledAt has passed.
//
// If a post has autoRegenerate set, we try to get fresh AI content for it
// right before publishing. That's the AI-credit-exhaustion case the rest
// of the app cares about: if the user is out of credits at that moment, we
// don't skip the post or leave it stuck — we publish it with fallback
// (non-AI, template-based) content instead, and mark it so the UI can flag
// it for the user to review afterwards.
const publishDuePosts = async () => {
    let due;

    try {
        due = await postService.getDuePosts();
    } catch (error) {
        console.error("Scheduler: failed to load due posts:", error.message);
        return;
    }

    for (const post of due) {
        try {
            if (post.autoRegenerate) {
                const { allowed, credits } = await userService.consumeCredit(post.user, 1);

                if (allowed) {
                    try {
                        const fresh = await aiService.generateSocialPosts({
                            topic: post.topic,
                            platform: post.platform,
                            tone: post.tone,
                            audience: post.audience
                        });
                        post.content = fresh;
                        post.usedFallback = false;
                    } catch (aiError) {
                        console.error(
                            `Scheduler: AI call failed for post ${post._id}, refunding credit and using fallback:`,
                            aiError.message
                        );
                        await userService.consumeCredit(post.user, -1);
                        post.content = aiService.generateFallbackPosts({
                            topic: post.topic,
                            platform: post.platform,
                            tone: post.tone,
                            audience: post.audience
                        });
                        post.usedFallback = true;
                    }
                } else {
                    // Out of AI credits — still publish, just with fallback
                    // content, so the automation never silently stalls.
                    console.warn(
                        `Scheduler: user ${post.user} has 0 AI credits, publishing post ${post._id} with fallback content`
                    );
                    post.content = aiService.generateFallbackPosts({
                        topic: post.topic,
                        platform: post.platform,
                        tone: post.tone,
                        audience: post.audience
                    });
                    post.usedFallback = true;
                }
            }

            const result = await socialPublisher.publishToPlatform({
                userId: post.user,
                platform: post.platform,
                content: post.content,
                mediaUrl: post.mediaUrl
            });

            post.status = "published";
            post.publishedAt = new Date();
            post.postedToRealPlatform = result.posted;
            post.externalPostError = result.posted ? undefined : result.reason;
            await post.save();

            console.log(
                `Scheduler: published post ${post._id}` +
                (post.usedFallback ? " (fallback content)" : "") +
                (result.posted ? ` → sent to ${post.platform}` : ` (in-app only: ${result.reason})`)
            );

        } catch (error) {
            console.error(`Scheduler: failed to publish post ${post._id}:`, error.message);
        }
    }
};

const start = () => {
    console.log("Scheduler: watching for due scheduled posts every 60s");
    setInterval(publishDuePosts, CHECK_INTERVAL_MS);
};

module.exports = { start, publishDuePosts };
