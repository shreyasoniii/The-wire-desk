const crypto = require("crypto");

const X_AUTH_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_ME_URL = "https://api.x.com/2/users/me";
const X_TWEETS_URL = "https://api.x.com/2/tweets";

const SCOPES = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "offline.access"
];

const base64url = (buf) =>
    buf
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

// --------------------------------------------------
// PKCE
// --------------------------------------------------

const generatePkce = () => {
    const codeVerifier = base64url(
        crypto.randomBytes(32)
    );

    const codeChallenge = base64url(
        crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest()
    );

    return {
        codeVerifier,
        codeChallenge
    };
};

// --------------------------------------------------
// X Authorization URL
// --------------------------------------------------

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

// --------------------------------------------------
// Basic Authentication
// --------------------------------------------------

const basicAuthHeader = () => {
    const clientId = process.env.X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;

    if (!clientId) {
        throw new Error("X_CLIENT_ID is missing");
    }

    if (!clientSecret) {
        throw new Error("X_CLIENT_SECRET is missing");
    }

    const credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString("base64");

    return `Basic ${credentials}`;
};

// --------------------------------------------------
// Exchange Authorization Code for Access Token
// --------------------------------------------------

const exchangeCodeForToken = async (code, codeVerifier) => {

    if (!code) {
        throw new Error("X authorization code is missing");
    }

    if (!codeVerifier) {
        throw new Error("X PKCE code verifier is missing");
    }

    if (!process.env.X_CLIENT_ID) {
        throw new Error("X_CLIENT_ID is missing");
    }

    if (!process.env.X_CLIENT_SECRET) {
        throw new Error("X_CLIENT_SECRET is missing");
    }

    if (!process.env.X_REDIRECT_URI) {
        throw new Error("X_REDIRECT_URI is missing");
    }

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.X_REDIRECT_URI,
        code_verifier: codeVerifier
    });

    console.log("-----------------------------------");
    console.log("X OAuth Token Exchange");
    console.log("-----------------------------------");
    console.log("Client ID:", process.env.X_CLIENT_ID);
    console.log("Redirect URI:", process.env.X_REDIRECT_URI);
    console.log("Code exists:", !!code);
    console.log("Code verifier exists:", !!codeVerifier);
    console.log("Client secret exists:", !!process.env.X_CLIENT_SECRET);

    const res = await fetch(X_TOKEN_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": basicAuthHeader()
        },

        body: params.toString()
    });

    const responseText = await res.text();

    console.log("X Token Response Status:", res.status);
    console.log("X Token Response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch (error) {
        throw new Error(
            `X returned invalid response: ${responseText}`
        );
    }

    if (!res.ok) {
        throw new Error(
            data.error_description ||
            data.error ||
            data.detail ||
            data.message ||
            `X token exchange failed (${res.status})`
        );
    }

    console.log("X access token received:", !!data.access_token);
    console.log("X refresh token received:", !!data.refresh_token);
    console.log("-----------------------------------");

    return data;
};

// --------------------------------------------------
// Refresh X Access Token
// --------------------------------------------------

const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new Error("X refresh token is missing");
    }

    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });

    const res = await fetch(X_TOKEN_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": basicAuthHeader()
        },

        body: params.toString()
    });

    const responseText = await res.text();

    console.log("X Refresh Token Status:", res.status);
    console.log("X Refresh Token Response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error(
            `X returned invalid refresh response: ${responseText}`
        );
    }

    if (!res.ok) {
        throw new Error(
            data.error_description ||
            data.error ||
            data.detail ||
            "Failed to refresh X access token"
        );
    }

    return data;
};

// --------------------------------------------------
// Get X Profile
// --------------------------------------------------

const getProfile = async (accessToken) => {

    if (!accessToken) {
        throw new Error("X access token is missing");
    }

    const res = await fetch(X_ME_URL, {
        method: "GET",

        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const responseText = await res.text();

    console.log("X Profile Status:", res.status);
    console.log("X Profile Response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error(
            `X returned invalid profile response: ${responseText}`
        );
    }

    if (!res.ok) {
        throw new Error(
            data.detail ||
            data.title ||
            data.error ||
            "Failed to fetch X profile"
        );
    }

    if (!data.data) {
        throw new Error("X profile data is missing");
    }

    return data.data;
};

// --------------------------------------------------
// Publish Post on X
// --------------------------------------------------

const publishPost = async ({ accessToken, text }) => {

    if (!accessToken) {
        throw new Error("X access token is missing");
    }

    if (!text) {
        throw new Error("Post text is required");
    }

    const postText = String(text).slice(0, 280);

    const res = await fetch(X_TWEETS_URL, {
        method: "POST",

        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text: postText
        })
    });

    const responseText = await res.text();

    console.log("X Publish Status:", res.status);
    console.log("X Publish Response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error(
            `X returned invalid publish response: ${responseText}`
        );
    }

    if (!res.ok) {
        throw new Error(
            data.detail ||
            data.title ||
            data.error ||
            `X publish failed (${res.status})`
        );
    }

    if (!data.data || !data.data.id) {
        throw new Error("X post ID missing from response");
    }

    return data.data.id;
};

// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = {
    generatePkce,
    getAuthUrl,
    exchangeCodeForToken,
    refreshAccessToken,
    getProfile,
    publishPost
};