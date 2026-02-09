import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090/rockgymapp';

const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/settings`);
    return response.data;
  },

  // Get current settings (valid today)
  getCurrentSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/current`);
    return response.data;
  },

  // Get future settings
  getFutureSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/future`);
    return response.data;
  },

  // Get settings by key
  getSettingsByKey: async (key) => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/key/${key}`);
    return response.data;
  },

  // Get setting by key and date
  getSettingByKeyAndDate: async (key, date) => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/key/${key}/date/${date}`);
    return response.data;
  },

  // Get current monthly fee
  getMonthlyFee: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/monthly-fee`);
    return response.data;
  },

  // Get monthly fee for date
  getMonthlyFeeForDate: async (date) => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/monthly-fee/date?date=${date}`);
    return response.data;
  },

  // Get current admission fee
  getAdmissionFee: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/admission-fee`);
    return response.data;
  },

  // Get admission fee for date
  getAdmissionFeeForDate: async (date) => {
    const response = await axios.get(`${API_BASE_URL}/api/settings/admission-fee/date?date=${date}`);
    return response.data;
  },

  // Create new setting
  createSetting: async (settingData) => {
    const response = await axios.post(`${API_BASE_URL}/api/settings`, settingData);
    return response.data;
  },

  // Update setting
  updateSetting: async (id, settingData) => {
    const response = await axios.put(`${API_BASE_URL}/api/settings/${id}`, settingData);
    return response.data;
  },

  // Deactivate setting
  deactivateSetting: async (id) => {
    const response = await axios.put(`${API_BASE_URL}/api/settings/${id}/deactivate`);
    return response.data;
  },

  // Delete setting
  deleteSetting: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/settings/${id}`);
    return response.data;
  }
};

export default settingsService;
