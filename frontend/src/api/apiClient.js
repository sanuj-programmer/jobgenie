import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
});

// Configure Axios to send cookies automatically with all cross-site requests
API.defaults.withCredentials = true;

// Intercept 401 responses to automatically redirect users on session expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    
    return Promise.reject(error);
  }
);

export default API;
