import api from './api';

export const birthdayService = {
  // Get upcoming birthdays
  getUpcomingBirthdays: (monthYear) => {
    return api.get('/birthday/upcoming', {
      params: { input: monthYear }
    });
  },

  // Get today's birthdays
  getTodaysBirthdays: () => {
    return api.get('/birthday/today');
  },

  // Get this week's birthdays
  getThisWeeksBirthdays: () => {
    return api.get('/birthday/this-week');
  },

  // Get this month's birthdays
  getThisMonthsBirthdays: () => {
    return api.get('/birthday/this-month');
  },
};