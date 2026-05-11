import api from '../../../services/api';

const footerLinkService = {
  getAllLinks: async () => {
    const response = await api.get('/admin/footer-links');
    return response.data;
  },

  addLink: async (linkData) => {
    const response = await api.post('/admin/footer-links', linkData);
    return response.data;
  },

  updateLink: async (id, linkData) => {
    const response = await api.put(`/admin/footer-links/${id}`, linkData);
    return response.data;
  },

  deleteLink: async (id) => {
    const response = await api.delete(`/admin/footer-links/${id}`);
    return response.data;
  }
};

export default footerLinkService;
