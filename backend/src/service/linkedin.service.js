// Real LinkedIn OAuth + posting integration.
//
// Requires a LinkedIn Developer app (developer.linkedin.com) with the
// "Sign In with LinkedIn using OpenID Connect" AND "Share on LinkedIn"
// products added, and these set in .env:
//   LINKEDIN_CLIENT_ID
//   LINKEDIN_CLIENT_SECRET
//   LINKEDIN_REDIRECT_URI   (must exactly match a redirect URL registered
//                            on the LinkedIn app, e.g.
//                            http://localhost:5050/api/social/linkedin/callback)
//
// NOTE: LinkedIn's API surface changes over time (endpoint paths, required
// headers/versions, scope names). This targets the widely-documented
// /v2/ugcPosts flow as of early 2026 — if LinkedIn has since deprecated or
// versioned it, check https://learn.microsoft.com/en-us/linkedin/ for the
// current posts API and adjust LINKEDIN_UGC_POSTS_URL / the request body
// accordingly.

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

const SCOPES = ["openid", "profile", "w_member_social"];

const getAuthUrl = (state) => {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        state,
        scope: SCOPES.join(" ")
    });

    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
    });

    const res = await fetch(LINKEDIN_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error_description || "Failed to exchange LinkedIn authorization code");
    }

    // { access_token, expires_in, refresh_token?, ... }
    return data;
};

const getProfile = async (accessToken) => {
    const res = await fetch(LINKEDIN_USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch LinkedIn profile");
    }

    // { sub, name, email, ... } — `sub` is the LinkedIn member id used to
    // build the author URN for posting.
    return data;
};

const publishPost = async ({ accessToken, personId, text }) => {
    const res = await fetch(LINKEDIN_UGC_POSTS_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        },
        body: JSON.stringify({
            author: `urn:li:person:${personId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`LinkedIn publish failed (${res.status}): ${errText}`);
    }

    // LinkedIn returns the created share's URN in this response header.
    return res.headers.get("x-restli-id") || null;
};

module.exports = {
    getAuthUrl,
    exchangeCodeForToken,
    getProfile,
    publishPost
};
