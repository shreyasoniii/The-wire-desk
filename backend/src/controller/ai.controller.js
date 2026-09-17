const aiService = require("../service/ai.service");
const userService = require("../service/user.service");

// Generates 3 social posts for the logged-in user.
//
// Credit flow:
// 1. Try to spend 1 credit up front. If the user has 0 credits, skip the
//    AI call entirely and return template-based fallback content instead
//    of failing the request — the caller is told via usedFallback: true.
// 2. If the credit spend succeeded, call the AI. If that call itself
//    fails (bad key, provider outage, etc), refund the credit and fall
//    back to template content the same way.
const generatePost = async (req, res) => {
    try {
        const { topic, platform, tone, audience } = req.body;

        if (!topic || !platform || !tone || !audience) {
            return res.status(400).json({
                success: false,
                message: "topic, platform, tone and audience are required"
            });
        }

        const { allowed, credits } = await userService.consumeCredit(req.userId, 1);

        let text;
        let usedFallback;

        if (!allowed) {
            text = aiService.generateFallbackPosts({ topic, platform, tone, audience });
            usedFallback = true;
        } else {
            try {
                text = await aiService.generateSocialPosts({ topic, platform, tone, audience });
                usedFallback = false;
            } catch (aiError) {
                console.error("AI generation failed, refunding credit and using fallback:", aiError.message);
                await userService.consumeCredit(req.userId, -1);
                text = aiService.generateFallbackPosts({ topic, platform, tone, audience });
                usedFallback = true;
            }
        }

        res.status(200).json({
            success: true,
            message: usedFallback
                ? "AI credits were unavailable — generated fallback content instead"
                : "Post generated successfully",
            data: text,
            usedFallback,
            creditsRemaining: usedFallback && !allowed ? credits : undefined
        });

    } catch (error) {
        console.error("AI generation error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    generatePost
};
