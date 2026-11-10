

const API_BASE_URL = import.meta.env.PROD
  ? 'https://massaging-app-wn9s.onrender.com' // 👈 Replace with your actual Render URL when ready
  : '';

const getSocketBaseUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.PROD) {
    return 'https://massaging-app-wn9s.onrender.com';
  }
  // Dev: connect to backend on the same host as the page so the
  // connect.sid session cookie is sent (localhost for PC, IP for phone).
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const host = hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'localhost'
    : hostname;
  return `http://${host}:8080`;
};

const SOCKET_BASE_URL = getSocketBaseUrl();

export default API_BASE_URL;
export { SOCKET_BASE_URL };
