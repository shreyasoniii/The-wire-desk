const Social = require("../model/social.model");

const connectAccount = async (
    userId,
    { platform, username, platformUserId, accessToken, refreshToken, expiresAt }
) => {

    const account = await Social.create({
        user: userId,
        platform,
        username,
        platformUserId,
        accessToken,
        refreshToken,
        expiresAt
    });

    return account;
};

const getAllAccounts = async (userId) => {
    // Never send access/refresh tokens back to the client.
    return Social.find({ user: userId }).select("-accessToken -refreshToken");
};

const disconnectAccount = async (userId, id) => {
    const account = await Social.findOneAndDelete({ _id: id, user: userId });

    if (!account) {
        throw new Error("Connected account not found");
    }

    return account;
};

module.exports = {
    connectAccount,
    getAllAccounts,
    disconnectAccount
};
