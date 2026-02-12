/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
};
