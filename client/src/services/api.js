import axios from 'axios';

// Use the Vercel environment variable in production, fallback to localhost for development
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalReq = err.config;
    if (err.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Use the same dynamic base URL for the refresh request
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { token: refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalReq.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalReq);
      } catch {
        localStorage.clear();
        window.location = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;