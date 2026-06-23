import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Enable automatic cookie sending
});

// Token is now in HTTP-only cookie — no manual injection needed

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors on non-login pages
    if (error.response?.status === 401) {
      // Don't redirect if already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        // Token expired or invalid - clear local data and dispatch logout event
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('logout', { detail: { reason: 'token_expired' } }));
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || 'Erreur réseau';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;