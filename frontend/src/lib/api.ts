import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    xsrfCookieName: 'csrf_token',
    xsrfHeaderName: 'X-CSRF-Token',
});

export default api;
