import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true; // Important for cookies/sessions

// Add a request interceptor to handle authentication
axios.interceptors.request.use(
  (config) => {
    // You can add any request modification here
    // For example, if you're using token-based auth:
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear any local auth state
      // localStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/' && 
          !window.location.pathname.includes('/google/callback')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;