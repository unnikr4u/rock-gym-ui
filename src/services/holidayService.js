import api from './api';

export const holidayService = {
  // Create holiday
  createHoliday: (holidayData) => {
    return api.post('/holidays', holidayData);
  },

  // Get all holidays
  getAllHolidays: () => {
    return api.get('/holidays');
  },

  // Get holiday by ID
  getHolidayById: (id) => {
    return api.get(`/holidays/${id}`);
  },

  // Update holiday
  updateHoliday: (id, holidayData) => {
    return api.put(`/holidays/${id}`, holidayData);
  },

  // Delete holiday
  deleteHoliday: (id) => {
    return api.delete(`/holidays/${id}`);
  },
};