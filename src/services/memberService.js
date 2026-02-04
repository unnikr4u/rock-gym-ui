import api from './api';

export const memberService = {
  // Get all members with pagination and admin filter
  getAllMembers: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc', isAdmin = false, search = '') => {
    const params = { page, size, sortBy, sortDir, isAdmin };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return api.get('/members', { params });
  },

  // Get admin members with pagination
  getAdminMembers: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc', search = '') => {
    const params = { page, size, sortBy, sortDir, isAdmin: true };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return api.get('/members', { params });
  },

  // Get all members without pagination (for backward compatibility)
  getAllMembersNoPagination: () => api.get('/members?size=1000'),

  // Get member by ID
  getMemberById: (id) => api.get(`/members/${id}`),

  // Get paid members
  getPaidMembers: () => api.get('/members/paid'),

  // Get unpaid members
  getUnpaidMembers: () => api.get('/members/unpaid'),

  // Get unattended members
  getUnattendedMembers: () => api.get('/members/unattended-members'),

  // Get unattended members with pagination
  getUnattendedMembersPaginated: (page = 0, size = 10, sortBy = 'doj', sortDir = 'desc') => {
    return api.get('/members/unattended-members-paginated', {
      params: { page, size, sortBy, sortDir }
    });
  },

  // Get active members with pagination (last 7 days)
  getActiveMembersPaginated: (page = 0, size = 10, sortBy = 'lastPunchTime', sortDir = 'desc') => {
    return api.get('/report/active-last-7-days-paginated', {
      params: { page, size }
    });
  },

  // Get employee monthly punch summary
  getEmployeeMonthlyPunchSummary: (employeeId) => {
    return api.get(`/punch/employee-monthly-summary?employeeId=${employeeId}`);
  },

  // Create new member
  createMember: (memberData) => {
    return api.post('/members', memberData);
  },

  // Update existing member
  updateMember: (memberId, memberData) => {
    return api.put(`/members/${memberId}`, memberData);
  },

  // Upload members Excel file
  uploadMembers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/members/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload access file
  uploadAccessFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/members/access-file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};