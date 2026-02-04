import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Calendar, Gift, Phone, ArrowLeft } from 'lucide-react';
import { birthdayService } from '../services/birthdayService';
import LoadingSpinner from '../components/LoadingSpinner';

const Birthdays = () => {
  const [selectedView, setSelectedView] = useState(null); // 'today', 'week', 'month'
  const [selectedData, setSelectedData] = useState([]);

  // Auto-load today's, this week's, and this month's birthdays
  const { data: todaysBirthdays, isLoading: loadingToday } = useQuery(
    'todaysBirthdays',
    () => birthdayService.getTodaysBirthdays()
  );

  const { data: thisWeeksBirthdays, isLoading: loadingWeek } = useQuery(
    'thisWeeksBirthdays',
    () => birthdayService.getThisWeeksBirthdays()
  );

  const { data: thisMonthsBirthdays, isLoading: loadingMonth } = useQuery(
    'thisMonthsBirthdays',
    () => birthdayService.getThisMonthsBirthdays()
  );

  const handleCardClick = (type) => {
    let data = [];
    let title = '';
    
    switch (type) {
      case 'today':
        data = todaysBirthdays?.data || [];
        title = "Today's Birthdays";
        break;
      case 'week':
        data = thisWeeksBirthdays?.data || [];
        title = "This Week's Birthdays";
        break;
      case 'month':
        data = thisMonthsBirthdays?.data || [];
        title = "This Month's Birthdays";
        break;
      default:
        return;
    }
    
    setSelectedView(title);
    setSelectedData(data);
  };

  const handleBackClick = () => {
    setSelectedView(null);
    setSelectedData([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAge = (dobString) => {
    if (!dobString) return '-';
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const getDaysUntilBirthday = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    const thisYear = today.getFullYear();
    
    // Set birthday for this year
    const birthdayThisYear = new Date(thisYear, dob.getMonth(), dob.getDate());
    
    // If birthday has passed this year, calculate for next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(thisYear + 1);
    }
    
    const diffTime = birthdayThisYear - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {selectedView ? (
        // Show member details view
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackClick}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedView}</h1>
              <p className="text-gray-600">{selectedData.length} member{selectedData.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          {selectedData.length > 0 ? (
            <div className="space-y-4">
              {/* Birthday Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedData.map((member) => {
                  const daysUntil = getDaysUntilBirthday(member.dob);
                  const isToday = daysUntil === 0;
                  const isUpcoming = daysUntil > 0 && daysUntil <= 7;
                  
                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border-2 ${
                        isToday
                          ? 'border-green-500 bg-green-50'
                          : isUpcoming
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">ID: {member.id}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{formatDate(member.dob)}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{member.contactNo || 'No contact'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {getAge(member.dob)}
                          </div>
                          <div className="text-xs text-gray-600">years old</div>
                          {daysUntil !== null && (
                            <div className={`mt-2 text-xs font-medium ${
                              isToday
                                ? 'text-green-700'
                                : isUpcoming
                                ? 'text-yellow-700'
                                : 'text-gray-600'
                            }`}>
                              {isToday ? 'Today!' : `${daysUntil} days`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(isToday || isUpcoming) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="w-full btn-primary text-sm py-1">
                            Send Birthday Wishes
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Birthday Table */}
              <div className="card mt-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header">ID</th>
                        <th className="table-header">Name</th>
                        <th className="table-header">Birthday</th>
                        <th className="table-header">Age</th>
                        <th className="table-header">Contact</th>
                        <th className="table-header">Gender</th>
                        <th className="table-header">Days Until</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedData.map((member) => {
                        const daysUntil = getDaysUntilBirthday(member.dob);
                        const isToday = daysUntil === 0;
                        
                        return (
                          <tr key={member.id} className={`hover:bg-gray-50 ${isToday ? 'bg-green-50' : ''}`}>
                            <td className="table-cell font-medium">{member.id}</td>
                            <td className="table-cell">{member.name}</td>
                            <td className="table-cell">{formatDate(member.dob)}</td>
                            <td className="table-cell">{getAge(member.dob)}</td>
                            <td className="table-cell">{member.contactNo || '-'}</td>
                            <td className="table-cell">{member.gender || '-'}</td>
                            <td className="table-cell">
                              {daysUntil !== null && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  isToday
                                    ? 'bg-green-100 text-green-800'
                                    : daysUntil <= 7
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {isToday ? 'Today!' : `${daysUntil} days`}
                                </span>
                              )}
                            </td>
                            <td className="table-cell">
                              <button className="text-primary-600 hover:text-primary-900 text-sm">
                                Send Wishes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No birthdays found for this period</p>
            </div>
          )}
        </div>
      ) : (
        // Show main dashboard view
        <div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Birthday Management</h1>
            <p className="text-gray-600">Track and celebrate member birthdays</p>
          </div>

          {/* Clickable Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleCardClick('today')}
              className="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              disabled={loadingToday}
            >
              <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Today's Birthdays</h3>
              {loadingToday ? (
                <LoadingSpinner size="sm" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {todaysBirthdays?.data?.length || 0}
                </p>
              )}
              <p className="text-sm text-gray-600">Celebrate today!</p>
            </button>

            <button
              onClick={() => handleCardClick('week')}
              className="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              disabled={loadingWeek}
            >
              <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">This Week</h3>
              {loadingWeek ? (
                <LoadingSpinner size="sm" />
              ) : (
                <p className="text-2xl font-bold text-yellow-600">
                  {thisWeeksBirthdays?.data?.length || 0}
                </p>
              )}
              <p className="text-sm text-gray-600">Monday to Sunday</p>
            </button>

            <button
              onClick={() => handleCardClick('month')}
              className="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              disabled={loadingMonth}
            >
              <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">This Month</h3>
              {loadingMonth ? (
                <LoadingSpinner size="sm" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {thisMonthsBirthdays?.data?.length || 0}
                </p>
              )}
              <p className="text-sm text-gray-600">Current month</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Birthdays;