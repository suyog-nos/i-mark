/**
 * Validates password strength based on security requirements:
 * - Minimum length: 8
 * - At least one number
 * - At least one special character
 * 
 * @param {string} password 
 * @returns {object} { valid: boolean, message: string|null }
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required.' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }

    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number.' };
    }

    // Check for special characters (non-alphanumeric)
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character.' };
    }

    return { valid: true, message: null };
};

module.exports = {
    validatePassword
};
