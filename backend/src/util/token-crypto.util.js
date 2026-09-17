// Encrypts/decrypts social account tokens before they touch the database,
// using AES-256-GCM with a key from TOKEN_ENCRYPTION_KEY (a 64-char hex
// string = 32 bytes). Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
// Wired in as mongoose set/get transforms on the Social model's token
// fields, so the rest of the app just reads/writes plain strings and never
// has to think about encryption directly.

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

const getKey = () => {
    const raw = process.env.TOKEN_ENCRYPTION_KEY;

    if (!raw) {
        throw new Error(
            "TOKEN_ENCRYPTION_KEY is not configured — set a 64-character hex string in .env"
        );
    }

    const key = Buffer.from(raw, "hex");

    if (key.length !== 32) {
        throw new Error(
            "TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (a 64-character hex string)"
        );
    }

    return key;
};

const encrypt = (plainText) => {
    if (plainText === undefined || plainText === null || plainText === "") {
        return plainText;
    }

    // Already encrypted (e.g. re-saving a document without touching this
    // field) — pass through unchanged instead of double-encrypting.
    if (typeof plainText === "string" && plainText.startsWith(PREFIX)) {
        return plainText;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    const encrypted = Buffer.concat([
        cipher.update(String(plainText), "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return (
        PREFIX +
        [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":")
    );
};

const decrypt = (value) => {
    if (!value || typeof value !== "string" || !value.startsWith(PREFIX)) {
        return value;
    }

    const [ivHex, authTagHex, dataHex] = value.slice(PREFIX.length).split(":");

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
};

module.exports = { encrypt, decrypt };
