// Real Instagram OAuth + posting integration, via the Facebook/Meta Graph
// API (Instagram's own API doesn't do OAuth directly — publishing routes
// through a Facebook Page that has an Instagram Business or Creator
// account linked to it).
//
// Requires a Meta developer app (developers.facebook.com) with the
// Instagram Graph API product added, and these set in .env:
//   FB_APP_ID
//   FB_APP_SECRET
//   FB_REDIRECT_URI   (must exactly match a valid OAuth redirect URI
//                      registered on the app, e.g.
//                      http://localhost:5050/api/social/instagram/callback)
//
// IMPORTANT LIMITATION: Instagram's API cannot publish a text-only post —
// every feed post needs an image or video (image_url/video_url pointing
// at a publicly reachable file). publishPost() below throws a clear error
// if no imageUrl is given, since this app doesn't yet have image
// generation/hosting wired up. Connecting an account still works fully;
// only the actual "publish" step is blocked without an image.
//
// Also: Meta requires apps to go through App Review before most of this
// works for any user other than the app's own developers/testers — until
// then, only accounts added as testers in the Meta dashboard can connect.

const FB_VERSION = "v21.0";
const FB_AUTH_URL = `https://www.facebook.com/${FB_VERSION}/dialog/oauth`;
const FB_TOKEN_URL = `https://graph.facebook.com/${FB_VERSION}/oauth/access_token`;
const FB_GRAPH_URL = `https://graph.facebook.com/${FB_VERSION}`;

const SCOPES = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement"
];

const getAuthUrl = (state) => {
    const params = new URLSearchParams({
        client_id: process.env.FB_APP_ID,
        redirect_uri: process.env.FB_REDIRECT_URI,
        state,
        scope: SCOPES.join(",")
    });

    return `${FB_AUTH_URL}?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
    const params = new URLSearchParams({
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        redirect_uri: process.env.FB_REDIRECT_URI,
        code
    });

    const res = await fetch(`${FB_TOKEN_URL}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || "Failed to exchange Facebook authorization code");
    }

    // { access_token, token_type, expires_in } — short-lived (~1-2h)
    return data;
};

const getLongLivedToken = async (shortLivedToken) => {
    const params = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortLivedToken
    });

    const res = await fetch(`${FB_TOKEN_URL}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || "Failed to get a long-lived Facebook token");
    }

    // { access_token, expires_in } — long-lived (~60 days)
    return data;
};

// Finds the first Facebook Page this user manages that has an Instagram
// Business/Creator account linked, and returns the page-scoped access
// token (used for publishing) plus the Instagram account's own id.
const findInstagramBusinessAccount = async (userAccessToken) => {
    const params = new URLSearchParams({
        fields: "id,name,access_token,instagram_business_account{id,username}",
        access_token: userAccessToken
    });

    const res = await fetch(`${FB_GRAPH_URL}/me/accounts?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || "Failed to list Facebook Pages");
    }

    const pageWithInstagram = (data.data || []).find((p) => p.instagram_business_account);

    if (!pageWithInstagram) {
        throw new Error(
            "No Instagram Business/Creator account found. Your Instagram account needs to be a Business or Creator account, linked to a Facebook Page you manage."
        );
    }

    return {
        pageAccessToken: pageWithInstagram.access_token,
        igUserId: pageWithInstagram.instagram_business_account.id,
        igUsername: pageWithInstagram.instagram_business_account.username
    };
};

const publishPost = async ({ accessToken, igUserId, caption, imageUrl }) => {
    if (!imageUrl) {
        throw new Error(
            "Instagram requires an image or video for every post — text-only posts aren't supported by Instagram's API."
        );
    }

    // Step 1: create a media container.
    const containerRes = await fetch(`${FB_GRAPH_URL}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken })
    });
    const containerData = await containerRes.json();

    if (!containerRes.ok) {
        throw new Error(containerData.error?.message || "Failed to create Instagram media container");
    }

    // Step 2: publish that container.
    const publishRes = await fetch(`${FB_GRAPH_URL}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken })
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok) {
        throw new Error(publishData.error?.message || "Failed to publish Instagram post");
    }

    return publishData.id;
};

module.exports = {
    getAuthUrl,
    exchangeCodeForToken,
    getLongLivedToken,
    findInstagramBusinessAccount,
    publishPost
};
