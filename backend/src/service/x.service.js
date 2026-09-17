// Real X (Twitter) OAuth 2.0 (Authorization Code + PKCE) + posting
// integration.
//
// Requires an X Developer app (developer.x.com) with OAuth 2.0 enabled and
// these set in .env:
//   X_CLIENT_ID
//   X_CLIENT_SECRET
//   X_REDIRECT_URI   (must exactly match a callback URL registered on the
//                      app, e.g. http://localhost:5050/api/social/x/callback)
//
// NOTE: X's write-access tier and exact API pricing/limits have changed
// more than once — check developer.x.com/en/portal for your app's current
// access level if posting fails with a 403.

const crypto = require("crypto");

const X_AUTH_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_ME_URL = "https://api.x.com/2/users/me";
const X_TWEETS_URL = "https://api.x.com/2/tweets";

const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"];

const base64url = (buf) =>
    buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// PKCE: a fresh verifier/challenge pair per connect attempt. The verifier
// travels inside the signed `state` we hand X (see social.controller.js)
// so we don't need any server-side session storage between the
// authorize step and the callback.
const generatePkce = () => {
    const codeVerifier = base64url(crypto.randomBytes(32));
    const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
    return { codeVerifier, codeChallenge };
};

const getAuthUrl = (state, codeChallenge) => {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.X_CLIENT_ID,
        redirect_uri: process.env.X_REDIRECT_URI,
        scope: SCOPES.join(" "),
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    });

    return `${X_AUTH_URL}?${params.toString()}`;
};

const basicAuthHeader = () =>
    "Basic " + Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64");

const exchangeCodeForToken = async (code, codeVerifier) => {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.X_REDIRECT_URI,
        code_verifier: codeVerifier
    });

    const res = await fetch(X_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: basicAuthHeader()
        },
        body: params.toString()
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error_description || data.error || "Failed to exchange X authorization code");
    }

    // { access_token, refresh_token, expires_in, scope, token_type }
    return data;
};

const refreshAccessToken = async (refreshToken) => {
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });

    const res = await fetch(X_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: basicAuthHeader()
        },
        body: params.toString()
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error_description || "Failed to refresh X access token");
    }

    return data;
};

const getProfile = async (accessToken) => {
    const res = await fetch(X_ME_URL, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch X profile");
    }

    // { id, name, username }
    return data.data;
};

const publishPost = async ({ accessToken, text }) => {
    const res = await fetch(X_TWEETS_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        // X enforces a 280 char limit — trim rather than let the API reject
        // an otherwise-fine post over a few stray characters.
        body: JSON.stringify({ text: String(text).slice(0, 280) })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || data.title || `X publish failed (${res.status})`);
    }

    return data.data.id;
};

module.exports = {
    generatePkce,
    getAuthUrl,
    exchangeCodeForToken,
    refreshAccessToken,
    getProfile,
    publishPost
};
