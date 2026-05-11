import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const publicFooterService = {
  getFooterLinks: async () => {
    // The endpoint is public as registered in server.js (reusing admin-routes but with public access)
    const response = await axios.get(`${API_URL}/admin/footer-links`);
    return response.data;
  }
};

export default publicFooterService;
