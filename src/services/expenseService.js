import api from './api';

export const expenseService = {
  // Get all expenses with pagination
  getAllExpenses: (page = 0, size = 10, year = null, month = null) => {
    const params = { page, size };
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/expenses', { params });
  },

  // Get expense by ID
  getExpenseById: (id) => {
    return api.get(`/expenses/${id}`);
  },

  // Create expense
  createExpense: (expense) => {
    return api.post('/expenses', expense);
  },

  // Update expense
  updateExpense: (id, expense) => {
    return api.put(`/expenses/${id}`, expense);
  },

  // Delete expense
  deleteExpense: (id) => {
    return api.delete(`/expenses/${id}`);
  },

  // Upload expenses from Excel
  uploadExpenses: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/expenses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
