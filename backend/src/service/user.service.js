const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });
};

const registerUser = async (user) => {
    const { name, email, password } = user;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const token = generateToken(newUser._id);

    return {
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        },
        token
    };
};


const loginUser = async (user) => {
    const { email, password } = user;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(existingUser._id);

    return {
        user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email
        },
        token
    };
};


const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


const updateUserProfile = async (userId, updates) => {
    const { name, email, password } = updates;

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (email && email !== user.email) {
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
            throw new Error("Email already in use");
        }
        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};


// ---------- AI credits ----------

// If a calendar month has passed since the last refill, top the user's
// credits back up to their monthly allowance. Mutates the given user
// document in place; caller is responsible for saving it.
const refillIfDue = (user) => {
    const now = new Date();
    const last = user.lastCreditRefill || user.createdAt || now;

    const monthsElapsed =
        (now.getFullYear() - last.getFullYear()) * 12 +
        (now.getMonth() - last.getMonth());

    if (monthsElapsed >= 1) {
        user.credits = user.monthlyCreditAllowance;
        user.lastCreditRefill = now;
    }
};

const getCredits = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    refillIfDue(user);
    await user.save();

    return {
        credits: user.credits,
        monthlyCreditAllowance: user.monthlyCreditAllowance
    };
};

// Tries to spend `amount` credits (default 1). Returns { allowed, credits }.
// - allowed=false, no balance change, when the user doesn't have enough
//   credits — this is the "AI has no credit" case callers check before
//   hitting the AI provider.
// - Pass a negative amount to refund a previously spent credit (e.g. when
//   the AI call itself failed after a credit was already deducted).
const consumeCredit = async (userId, amount = 1) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    refillIfDue(user);

    if (amount > 0) {
        if (user.credits < amount) {
            await user.save();
            return { allowed: false, credits: user.credits };
        }
        user.credits -= amount;
    } else {
        // Refund, capped at the monthly allowance so refunds can't push
        // a user's balance above what they're entitled to.
        user.credits = Math.min(
            user.monthlyCreditAllowance,
            user.credits - amount
        );
    }

    await user.save();

    return { allowed: true, credits: user.credits };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getCredits,
    consumeCredit
};
