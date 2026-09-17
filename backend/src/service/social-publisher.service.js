const Social = require("../model/social.model");
const linkedinService = require("./linkedin.service");
const xService = require("./x.service");
const instagramService = require("./instagram.service");

const REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh if expiring within 5 minutes

const ensureFreshAccessToken = async (account) => {
    if (account.platform !== "X") return account.accessToken;
    if (!account.expiresAt || !account.refreshToken) return account.accessToken;
    if (account.expiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS) return account.accessToken;

    const data = await xService.refreshAccessToken(account.refreshToken);

    account.accessToken = data.access_token;
    if (data.refresh_token) account.refreshToken = data.refresh_token;
    account.expiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined;

    await account.save();

    return account.accessToken;
};

// Looks up the user's connected account for the post's platform and
// actually posts to it. Returns { posted, reason? } rather than throwing,
// so a failed/unavailable platform integration never blocks a post from
// being marked published in-app — it just gets flagged so the user knows
// it didn't really go out and can fix it (reconnect, add an image, etc).
const publishToPlatform = async ({ userId, platform, content, mediaUrl }) => {
    const account = await Social.findOne({ user: userId, platform });

    if (!account) {
        return { posted: false, reason: `No connected ${platform} account` };
    }

    try {
        const accessToken = await ensureFreshAccessToken(account);

        if (platform === "LinkedIn") {
            await linkedinService.publishPost({
                accessToken,
                personId: account.platformUserId,
                text: content
            });
            return { posted: true };
        }

        if (platform === "X") {
            await xService.publishPost({ accessToken, text: content });
            return { posted: true };
        }

        if (platform === "Instagram") {
            await instagramService.publishPost({
                accessToken,
                igUserId: account.platformUserId,
                caption: content,
                imageUrl: mediaUrl
            });
            return { posted: true };
        }

        return { posted: false, reason: `${platform} publishing isn't implemented yet` };

    } catch (error) {
        console.error(`${platform} publish error:`, error.message);
        return { posted: false, reason: error.message };
    }
};

module.exports = { publishToPlatform };
