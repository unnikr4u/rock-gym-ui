import api from './api';

export const reportService = {
  // Get monthly revenue report
  getMonthlyRevenue: (months = 12) => {
    return api.get('/payments/reports/monthly-revenue', { params: { months } });
  },

  // Get payment collection summary
  getPaymentCollectionSummary: (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/payments/reports/collection-summary', { params });
  },

  // Get defaulters report
  getDefaulters: (page = 0, size = 10) => {
    return api.get('/payments/reports/defaulters', { params: { page, size } });
  },

  // Get payment mode analysis
  getPaymentModeAnalysis: (months = 12) => {
    return api.get('/payments/reports/payment-mode-analysis', { params: { months } });
  },

  // Get member payment history
  getMemberPaymentHistory: (memberId) => {
    return api.get(`/payments/reports/member-payment-history/${memberId}`);
  },

  // Get partner settlement report
  getPartnerSettlement: (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/payments/reports/partner-settlement', { params });
  },
};
