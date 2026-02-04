// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090/rockgymapp/api',
  TIMEOUT: 10000,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

// Payment Modes
export const PAYMENT_MODES = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
  'Cheque',
];

// Member Status
export const MEMBER_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  INACTIVE: 'Inactive',
};

// Report Types
export const REPORT_TYPES = {
  ATTENDANCE: 'attendance',
  LAST_PUNCH: 'lastPunch',
  NO_PUNCH: 'noPunch',
  INACTIVE: 'inactive',
  LAST_7_DAYS: 'last7Days',
};

// WhatsApp Templates
export const WHATSAPP_TEMPLATES = {
  PAYMENT_REMINDER: 'payment_reminder',
  BIRTHDAY_WISHES: 'birthday_wishes',
  MEMBERSHIP_EXPIRY: 'membership_expiry',
  WELCOME_MESSAGE: 'welcome_message',
};

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'en_US', name: 'English (US)' },
];