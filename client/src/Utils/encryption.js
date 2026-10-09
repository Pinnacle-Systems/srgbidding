import CryptoJS from 'crypto-js';

// Fallback key if env var is missing, though env var should be provided.
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'SuperSecretKey123!@#';

export const encryptData = (data) => {
    if (!data) return data;
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error("Encryption Error:", error);
        return null;
    }
};

export const decryptData = (encryptedString) => {
    if (!encryptedString) return encryptedString;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedString, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption Error:", error);
        return null;
    }
};
