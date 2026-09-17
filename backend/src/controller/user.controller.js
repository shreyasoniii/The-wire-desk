
const userService = require("../service/user.service");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Call service
        const { user, token } = await userService.registerUser({
            name,
            email,
            password
        });

        // Send response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
            token
        });

    } catch (error) {
        console.error("Register error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const { user, token } = await userService.loginUser({
            email,
            password
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
            token
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserProfile(req.userId);

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await userService.updateUserProfile(req.userId, {
            name,
            email,
            password
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getCredits = async (req, res) => {
    try {
        const data = await userService.getCredits(req.userId);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getCredits
};
