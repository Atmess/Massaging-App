

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://backend-blog-api-o2wd.onrender.com' // 👈 Replace with your actual Render URL when ready
  : 'http://localhost:8080';

export default API_BASE_URL;