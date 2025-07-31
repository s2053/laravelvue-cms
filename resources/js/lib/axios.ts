// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
});

// For CSRF cookie request (no /api prefix)
const csrfClient = axios.create({
    baseURL: '/', // or your full backend URL without /api
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error('Unauthorized');
            } else if (error.response.status >= 500) {
                console.error('Server error:', error.response.data.message || error.message);
            }
        } else {
            console.error('Network error:', error.message);
        }
        return Promise.reject(error);
    },
);

export { api, csrfClient };
