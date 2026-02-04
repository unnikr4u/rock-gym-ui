import api from './api';

export const paymentService = {
  // Save payment
  savePayment: (paymentData) => {
    return api.post('/payments', paymentData);
  },

  // Get pending payments
  getPendingPayments: (date) => {
    const params = date ? { date } : {};
    return api.get('/payments/pending', { params });
  },

  // Get member payment history
  getMemberPayments: (memberId) => {
    return api.get(`/payments/member/${memberId}`);
  },
};