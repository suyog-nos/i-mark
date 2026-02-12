import axios from 'axios';

/**
 * Setup Axios interceptor to handle 401 responses
 * @param {function} logoutCallback - Function to call on 401 response
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
