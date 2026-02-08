import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090/rockgymapp';

const partnerService = {
  getAllPartners: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/partners`);
    return response.data;
  },

  getActivePartners: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/partners/active`);
    return response.data;
  },

  getPartnerById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/partners/${id}`);
    return response.data;
  },

  getPartnerByEmployeeId: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/api/partners/employee/${employeeId}`);
    return response.data;
  },

  createPartner: async (partnerData) => {
    const response = await axios.post(`${API_BASE_URL}/api/partners`, partnerData);
    return response.data;
  },

  updatePartner: async (id, partnerData) => {
    const response = await axios.put(`${API_BASE_URL}/api/partners/${id}`, partnerData);
    return response.data;
  },

  deletePartner: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/partners/${id}`);
    return response.data;
  }
};

export default partnerService;
