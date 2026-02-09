import api from './api';

export const attendanceService = {
  // Upload punch Excel file
  uploadPunchData: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/punch/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get punch details with filters
  getPunchDetails: (params) => {
    return api.get('/punch/details', { params });
  },

  // Get punch frequency
  getPunchFrequency: (params) => {
    return api.get('/punch/frequency', { params });
  },

  // Get attendance report
  getAttendanceReport: (params) => {
    return api.get('/report/employee-attendance', { params });
  },

  // Get employee last punch report
  getEmployeeLastPunch: (params) => {
    return api.get('/report/employee-last-punch', { params });
  },

  // Get employees without punch
  getEmployeesWithoutPunch: (params) => {
    return api.get('/report/employees-without-punch', { params });
  },

  // Get inactive employees
  getInactiveEmployees: (params) => {
    return api.get('/report/inactive', { params });
  },

  // Get inactive employees after joining month
  getInactiveAfterJoining: (params) => {
    return api.get('/report/inactive-after-joining-month', { params });
  },

  // Get employees not punched in last 7 days
  getInactiveLast7Days: () => {
    return api.get('/report/inactive-last-7-days');
  },

  // Get employees not punched in last 30 days
  getInactiveLast30Days: () => {
    return api.get('/report/inactive-last-30-days');
  },

  // Get employees not punched in last 60 days
  getInactiveLast60Days: () => {
    return api.get('/report/inactive-last-60-days');
  },

  // Get employees not punched in last 15 days
  getInactiveLast15Days: () => {
    return api.get('/report/inactive-last-15-days');
  },

  // Paginated versions of inactive member endpoints
  getInactiveLast7DaysPaginated: (page = 0, size = 10) => {
    return api.get('/report/inactive-last-7-days-paginated', { 
      params: { page, size } 
    });
  },

  getInactiveLast15DaysPaginated: (page = 0, size = 10) => {
    return api.get('/report/inactive-last-15-days-paginated', { 
      params: { page, size } 
    });
  },

  getInactiveLast30DaysPaginated: (page = 0, size = 10) => {
    return api.get('/report/inactive-last-30-days-paginated', { 
      params: { page, size } 
    });
  },

  getInactiveLast60DaysPaginated: (page = 0, size = 10) => {
    return api.get('/report/inactive-last-60-days-paginated', { 
      params: { page, size } 
    });
  },

  // Get today's attendance
  getTodaysAttendance: () => {
    return api.get('/punch/today');
  },

  // Get today's attendance (optimized with JOINs)
  getTodaysAttendanceOptimized: () => {
    return api.get('/punch/today-optimized');
  },

  // Get punch details (optimized with JOINs)
  getPunchDetailsOptimized: (params) => {
    return api.get('/punch/details-optimized', { params });
  },

  // Get punch details by year
  getPunchDetailsByYear: (year) => {
    return api.get('/punch/details-by-year', { params: { year } });
  },

  // Get punch details by month/year
  getPunchDetailsByMonthYear: (monthYear) => {
    return api.get('/punch/details-by-month-year', { params: { monthYear } });
  },

  // Get punch details (paginated)
  getPunchDetailsOptimizedPaginated: (params) => {
    // Ensure all parameters are properly serialized and are the correct types
    const cleanParams = {};
    if (params.employeeId !== undefined && params.employeeId !== null) {
      cleanParams.employeeId = typeof params.employeeId === 'number' ? params.employeeId : parseInt(params.employeeId);
    }
    if (params.employeeName !== undefined && params.employeeName !== null && params.employeeName !== '') {
      cleanParams.employeeName = String(params.employeeName);
    }
    if (params.date !== undefined && params.date !== null && params.date !== '') {
      cleanParams.date = String(params.date);
    }
    if (params.page !== undefined && params.page !== null) {
      cleanParams.page = typeof params.page === 'number' ? params.page : parseInt(params.page) || 0;
    }
    if (params.size !== undefined && params.size !== null) {
      cleanParams.size = typeof params.size === 'number' ? params.size : parseInt(params.size) || 10;
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      cleanParams.sortBy = String(params.sortBy);
    }
    if (params.sortDir !== undefined && params.sortDir !== null && params.sortDir !== '') {
      cleanParams.sortDir = String(params.sortDir);
    }
    
    return api.get('/punch/details-paginated', { params: cleanParams });
  },

  // Get punch details by year (paginated)
  getPunchDetailsByYearPaginated: (year, page = 0, size = 10, sortBy = 'logDateTime', sortDir = 'desc') => {
    const cleanParams = {
      year: String(year),
      page: typeof page === 'number' ? page : parseInt(page) || 0,
      size: typeof size === 'number' ? size : parseInt(size) || 10,
      sortBy: String(sortBy),
      sortDir: String(sortDir)
    };
    
    return api.get('/punch/details-by-year-paginated', { params: cleanParams });
  },

  // Get punch details by month/year (paginated)
  getPunchDetailsByMonthYearPaginated: (monthYear, page = 0, size = 10, sortBy = 'logDateTime', sortDir = 'desc') => {
    const cleanParams = {
      monthYear: String(monthYear),
      page: typeof page === 'number' ? page : parseInt(page) || 0,
      size: typeof size === 'number' ? size : parseInt(size) || 10,
      sortBy: String(sortBy),
      sortDir: String(sortDir)
    };
    
    return api.get('/punch/details-by-month-year-paginated', { params: cleanParams });
  },

  // Test endpoint to get all punches
  getAllPunchesTest: () => {
    return api.get('/punch/test-all-punches');
  },

  // ========== CONSOLIDATED METHODS (NEW - Optimized) ==========

  /**
   * Get active employees using consolidated endpoint.
   * @param {string} period - Time period: 'today', 'last-7-days', 'last-30-days', 'this-month'
   * @param {boolean} paginated - Enable pagination
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise} API response
   */
  getActiveEmployees: (period, paginated = false, page = 0, size = 10) => {
    return api.get('/report/active', {
      params: { period, paginated, page, size }
    });
  },

  // Export inactive members to Excel
  exportInactiveMembersToExcel: (days) => {
    return api.get(`/report/export/inactive-members/excel?days=${days}`, {
      responseType: 'blob'
    });
  },

  // Export inactive members to PDF
  exportInactiveMembersToPdf: (days) => {
    return api.get(`/report/export/inactive-members/pdf?days=${days}`, {
      responseType: 'blob'
    });
  },

};