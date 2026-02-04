import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CalendarDays, Plus, Edit, Trash2 } from 'lucide-react';
import { holidayService } from '../services/holidayService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Holidays = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    holidayMonthYear: '',
    numberOfHolidays: ''
  });

  const queryClient = useQueryClient();

  const { data: holidays, isLoading } = useQuery(
    'holidays',
    () => holidayService.getAllHolidays()
  );

  const createMutation = useMutation(
    (data) => holidayService.createHoliday(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('holidays');
        toast.success('Holiday created successfully!');
        setShowForm(false);
        setFormData({ holidayMonthYear: '', numberOfHolidays: '' });
      },
      onError: (error) => {
        toast.error('Failed to create holiday: ' + (error.response?.data || error.message));
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => holidayService.updateHoliday(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('holidays');
        toast.success('Holiday updated successfully!');
        setEditingHoliday(null);
        setFormData({ holidayMonthYear: '', numberOfHolidays: '' });
      },
      onError: (error) => {
        toast.error('Failed to update holiday: ' + (error.response?.data || error.message));
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => holidayService.deleteHoliday(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('holidays');
        toast.success('Holiday deleted successfully!');
      },
      onError: (error) => {
        toast.error('Failed to delete holiday: ' + (error.response?.data || error.message));
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      holidayMonthYear: formData.holidayMonthYear,
      numberOfHolidays: parseInt(formData.numberOfHolidays)
    };

    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      holidayMonthYear: holiday.holidayMonthYear,
      numberOfHolidays: holiday.numberOfHolidays.toString()
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this holiday record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHoliday(null);
    setFormData({ holidayMonthYear: '', numberOfHolidays: '' });
  };

  const formatMonthYear = (monthYear) => {
    if (!monthYear) return monthYear;
    const [month, year] = monthYear.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holiday Management</h1>
          <p className="text-gray-600">Manage holidays for attendance calculations</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </button>
      </div>

      {/* Holiday Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month-Year
                </label>
                <input
                  type="text"
                  required
                  value={formData.holidayMonthYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, holidayMonthYear: e.target.value }))}
                  placeholder="MM-yyyy (e.g., 11-2025)"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: MM-yyyy (e.g., 11-2025 for November 2025)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Holidays
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.numberOfHolidays}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfHolidays: e.target.value }))}
                  className="input-field"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Saving...'
                    : editingHoliday
                    ? 'Update Holiday'
                    : 'Add Holiday'
                  }
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Holiday Records</h3>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Month-Year</th>
                  <th className="table-header">Number of Holidays</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {holidays?.data?.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{holiday.id}</td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{formatMonthYear(holiday.holidayMonthYear)}</div>
                        <div className="text-sm text-gray-500">{holiday.holidayMonthYear}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {holiday.numberOfHolidays} {holiday.numberOfHolidays === 1 ? 'holiday' : 'holidays'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(holiday)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(holiday.id)}
                          disabled={deleteMutation.isLoading}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {holidays?.data?.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No holiday records found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 btn-primary"
                >
                  Add First Holiday
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Holiday Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <CalendarDays className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Total Records</h3>
          <p className="text-2xl font-bold text-blue-600">
            {holidays?.data?.length || 0}
          </p>
        </div>
        <div className="card text-center">
          <CalendarDays className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Total Holidays</h3>
          <p className="text-2xl font-bold text-green-600">
            {holidays?.data?.reduce((sum, holiday) => sum + holiday.numberOfHolidays, 0) || 0}
          </p>
        </div>
        <div className="card text-center">
          <CalendarDays className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Average per Month</h3>
          <p className="text-2xl font-bold text-purple-600">
            {holidays?.data?.length > 0
              ? Math.round((holidays.data.reduce((sum, holiday) => sum + holiday.numberOfHolidays, 0) / holidays.data.length) * 10) / 10
              : 0
            }
          </p>
        </div>
      </div>

      {/* Information Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <CalendarDays className="h-6 w-6 text-blue-600 mt-1 mr-3" />
          <div>
            <h4 className="text-lg font-medium text-blue-900 mb-2">About Holiday Management</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Holiday records are used to calculate working days in attendance reports</p>
              <p>• Format month-year as MM-yyyy (e.g., 11-2025 for November 2025)</p>
              <p>• Number of holidays will be subtracted from total days to get working days</p>
              <p>• This helps in accurate attendance percentage calculations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holidays;