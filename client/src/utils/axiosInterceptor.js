import axios from 'axios';

/**
 * global-error-boundary
 * Intercepts all HTTP responses to enforce session security.
 * - 401 Handling: Automatically invalidates the local session and redirects to login 
 *   when the backend rejects a token (expired or tampered).
 * - Component Passthrough: Allows other error codes (400, 403, 500) to propagate 
 *   to individual components for specific handling.
 * @param {function} logoutCallback - The cleanup routine from AuthContext.
 */
export const setupAxiosInterceptor = (logoutCallback) => {
    // Response interceptor to catch 401 errors
    const interceptor = axios.interceptors.response.use(
        (response) => {
            // Return successful responses as-is
            return response;
        },
        (error) => {
            // Check if error is 401 Unauthorized
            if (error.response && error.response.status === 401) {
                console.log('Received 401 response, logging out...');

                // Clear auth state and redirect to login
                logoutCallback();

                // Optionally redirect to login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // Always reject the promise to allow error handling in components
            return Promise.reject(error);
        }
    );

    // Return the interceptor ID in case we need to eject it later
    return interceptor;
};

/**
 * Remove the interceptor
 * @param {number} interceptorId - The ID returned by setupAxiosInterceptor
 */
export const removeAxiosInterceptor = (interceptorId) => {
    axios.interceptors.response.eject(interceptorId);
};
