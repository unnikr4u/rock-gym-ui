import api from './api';

export const paymentService = {
  // Save payment
  savePayment: (paymentData) => {
    return api.post('/payments', paymentData);
  },

  // Get pending payments
  getPendingPayments: (date, page = 0, size = 10) => {
    const params = { pending: true, page, size };
    if (date) params.date = date;
    return api.get('/payments/pending', { params });
  },

  // Get paid payments
  getPaidPayments: (date, page = 0, size = 10) => {
    const params = { pending: false, page, size };
    if (date) params.date = date;
    return api.get('/payments/pending', { params });
  },

  // Get new joinee payments
  getNewJoineePayments: (date, page = 0, size = 10) => {
    const params = { page, size };
    if (date) params.date = date;
    return api.get('/payments/new-joinee', { params });
  },

  // Get member payment history
  getMemberPayments: (memberId) => {
    return api.get(`/payments/member/${memberId}`);
  },

  // Upload payment Excel file
  uploadPayments: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/payments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};