const OpenAI = require("openai");

let client = null;

const getClient = () => {
    if (!client) {
        if (!process.env.MISTRAL_API_KEY) {
            throw new Error("Mistral API key is not configured");
        }

        client = new OpenAI({
            apiKey: process.env.MISTRAL_API_KEY,
            baseURL: "https://api.mistral.ai/v1"
        });
    }

    return client;
};
const generateSocialPosts = async ({
    topic,
    platform,
    tone,
    audience
}) => {

    const prompt = `
You are an expert social media content writer.

Create 3 different social media posts.

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Target Audience: ${audience}

Requirements:
- Make each post engaging
- Keep the content suitable for the selected platform
- Do not repeat the same wording
- Include relevant hashtags
- Return only the 3 posts
`;

    const response = await getClient().chat.completions.create({
   model: "mistral-small-latest",
    messages: [
        {
            role: "user",
            content: prompt
        }
    ]
});

return response.choices[0].message.content;
};


// ---------- Fallback (no AI credit) content ----------
//
// Used when a user is out of AI credits, or when the OpenAI call itself
// fails (bad key, provider outage, rate limit, etc). It's template-based,
// not a network call, so it never fails and never costs a credit — the
// point is that automated posting (manual "generate" or the scheduler)
// never silently stalls just because the AI is unavailable. Callers are
// expected to flag the result to the user (usedFallback: true) so they
// know to review it before it goes out.

const HOOKS = [
    "Quick update:",
    "Here's what's on our radar:",
    "Worth sharing today:"
];

const CTAS = [
    "Let us know what you think in the comments.",
    "Follow along for more like this.",
    "Save this for later and share it with someone who needs it."
];

const STOPWORDS = new Set([
    "a", "an", "the", "our", "your", "my", "their", "his", "her", "its",
    "of", "for", "and", "or", "to", "in", "on", "at", "with", "is", "are",
    "new", "we", "us", "you", "it", "this", "that"
]);

const toHashtag = (word) =>
    "#" + word.replace(/[^a-zA-Z0-9]/g, "");

const buildHashtags = (topic, platform) => {
    const topicTags = topic
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => !STOPWORDS.has(word.toLowerCase()))
        .slice(0, 3)
        .map(toHashtag)
        .filter((tag) => tag.length > 1);

    const platformTag =
        platform === "LinkedIn" ? "#Business" :
        platform === "Instagram" ? "#InstaGood" :
        "#Trending";

    return [...new Set([...topicTags, platformTag])].join(" ");
};

const generateFallbackPosts = ({ topic, platform, tone, audience }) => {
    const hashtags = buildHashtags(topic, platform);

    const posts = [
        `${HOOKS[0]} ${topic}. If you're part of ${audience}, this is worth a look. ${CTAS[0]}\n${hashtags}`,
        `${HOOKS[1]} ${topic} — written with a ${tone} tone in mind for ${audience}. ${CTAS[1]}\n${hashtags}`,
        `${HOOKS[2]} ${topic}. A quick note for ${audience} out there. ${CTAS[2]}\n${hashtags}`
    ];

    return (
        posts.map((p, i) => `Post ${i + 1}:\n${p}`).join("\n\n---\n\n") +
        "\n\n(Template copy — AI credits were unavailable when this was generated. Please review before publishing.)"
    );
};

module.exports = {
    generateSocialPosts,
    generateFallbackPosts
};
