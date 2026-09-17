const jwt = require("jsonwebtoken");
const socialService = require("../service/social.service");
const linkedinService = require("../service/linkedin.service");
const xService = require("../service/x.service");
const instagramService = require("../service/instagram.service");

const connect = async (req, res) => {
    try {
        const { platform, username, platformUserId, accessToken, refreshToken, expiresAt } = req.body;

        if (!platform || !username || !platformUserId || !accessToken) {
            return res.status(400).json({
                success: false,
                message: "platform, username, platformUserId and accessToken are required"
            });
        }

        const account = await socialService.connectAccount(req.userId, {
            platform,
            username,
            platformUserId,
            accessToken,
            refreshToken,
            expiresAt
        });

        return res.status(201).json({
            success: true,
            message: "Account connected successfully",
            data: {
                _id: account._id,
                platform: account.platform,
                username: account.username,
                platformUserId: account.platformUserId,
                createdAt: account.createdAt
            }
        });

    } catch (error) {
        console.error("Connect account error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAll = async (req, res) => {
    try {
        const accounts = await socialService.getAllAccounts(req.userId);

        return res.status(200).json({
            success: true,
            data: accounts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const disconnect = async (req, res) => {
    try {
        const { id } = req.params;

        await socialService.disconnectAccount(req.userId, id);

        return res.status(200).json({
            success: true,
            message: "Account disconnected successfully"
        });

    } catch (error) {
        console.error("Disconnect account error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};



const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5500/frontend/index.html";

const linkedinConnect = async (req, res) => {
    try {
        const state = jwt.sign(
            { userId: req.userId, purpose: "linkedin_oauth" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const url = linkedinService.getAuthUrl(state);

        return res.status(200).json({ success: true, data: { url } });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const linkedinCallback = async (req, res) => {
    try {
        const { code, state, error: oauthError } = req.query;

        if (oauthError) {
            return res.redirect(`${frontendUrl()}?linkedin=error&reason=${encodeURIComponent(oauthError)}`);
        }
        if (!code || !state) {
            return res.redirect(`${frontendUrl()}?linkedin=error&reason=missing_code`);
        }

        let decoded;
        try {
            decoded = jwt.verify(state, process.env.JWT_SECRET);
        } catch {
            return res.redirect(`${frontendUrl()}?linkedin=error&reason=invalid_state`);
        }
        if (decoded.purpose !== "linkedin_oauth") {
            return res.redirect(`${frontendUrl()}?linkedin=error&reason=invalid_state`);
        }

        const tokenData = await linkedinService.exchangeCodeForToken(code);
        const profile = await linkedinService.getProfile(tokenData.access_token);

        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : undefined;

        await socialService.connectAccount(decoded.userId, {
            platform: "LinkedIn",
            username: profile.name || "LinkedIn account",
            platformUserId: profile.sub,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt
        });

        return res.redirect(`${frontendUrl()}?linkedin=connected`);

    } catch (error) {
        console.error("LinkedIn OAuth callback error:", error.message);
        return res.redirect(`${frontendUrl()}?linkedin=error&reason=${encodeURIComponent(error.message)}`);
    }
};

const xConnect = async (req, res) => {
    try {
        const { codeVerifier, codeChallenge } = xService.generatePkce();

        const state = jwt.sign(
            { userId: req.userId, purpose: "x_oauth", codeVerifier },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const url = xService.getAuthUrl(state, codeChallenge);

        return res.status(200).json({ success: true, data: { url } });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const xCallback = async (req, res) => {
    try {
        const { code, state, error: oauthError } = req.query;

        if (oauthError) {
            return res.redirect(`${frontendUrl()}?x=error&reason=${encodeURIComponent(oauthError)}`);
        }
        if (!code || !state) {
            return res.redirect(`${frontendUrl()}?x=error&reason=missing_code`);
        }

        let decoded;
        try {
            decoded = jwt.verify(state, process.env.JWT_SECRET);
        } catch {
            return res.redirect(`${frontendUrl()}?x=error&reason=invalid_state`);
        }
        if (decoded.purpose !== "x_oauth") {
            return res.redirect(`${frontendUrl()}?x=error&reason=invalid_state`);
        }

        const tokenData = await xService.exchangeCodeForToken(code, decoded.codeVerifier);
        const profile = await xService.getProfile(tokenData.access_token);

        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : undefined;

        await socialService.connectAccount(decoded.userId, {
            platform: "X",
            username: profile.username ? `@${profile.username}` : "X account",
            platformUserId: profile.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt
        });

        return res.redirect(`${frontendUrl()}?x=connected`);

    } catch (error) {
        console.error("X OAuth callback error:", error.message);
        return res.redirect(`${frontendUrl()}?x=error&reason=${encodeURIComponent(error.message)}`);
    }
};

const instagramConnect = async (req, res) => {
    try {
        const state = jwt.sign(
            { userId: req.userId, purpose: "instagram_oauth" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const url = instagramService.getAuthUrl(state);

        return res.status(200).json({ success: true, data: { url } });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const instagramCallback = async (req, res) => {
    try {
        const { code, state, error: oauthError } = req.query;

        if (oauthError) {
            return res.redirect(`${frontendUrl()}?instagram=error&reason=${encodeURIComponent(oauthError)}`);
        }
        if (!code || !state) {
            return res.redirect(`${frontendUrl()}?instagram=error&reason=missing_code`);
        }

        let decoded;
        try {
            decoded = jwt.verify(state, process.env.JWT_SECRET);
        } catch {
            return res.redirect(`${frontendUrl()}?instagram=error&reason=invalid_state`);
        }
        if (decoded.purpose !== "instagram_oauth") {
            return res.redirect(`${frontendUrl()}?instagram=error&reason=invalid_state`);
        }

        const shortLived = await instagramService.exchangeCodeForToken(code);
        const longLived = await instagramService.getLongLivedToken(shortLived.access_token);
        const { pageAccessToken, igUserId, igUsername } =
            await instagramService.findInstagramBusinessAccount(longLived.access_token);

        const expiresAt = longLived.expires_in
            ? new Date(Date.now() + longLived.expires_in * 1000)
            : undefined;

        await socialService.connectAccount(decoded.userId, {
            platform: "Instagram",
            username: igUsername ? `@${igUsername}` : "Instagram account",
            platformUserId: igUserId,
            accessToken: pageAccessToken,
            refreshToken: undefined,
            expiresAt
        });

        return res.redirect(`${frontendUrl()}?instagram=connected`);

    } catch (error) {
        console.error("Instagram OAuth callback error:", error.message);
        return res.redirect(`${frontendUrl()}?instagram=error&reason=${encodeURIComponent(error.message)}`);
    }
};

module.exports = {
    connect,
    getAll,
    disconnect,
    linkedinConnect,
    linkedinCallback,
    xConnect,
    xCallback,
    instagramConnect,
    instagramCallback
};
