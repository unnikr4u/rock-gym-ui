import { useState } from 'react';
import { useQuery } from 'react-query';
import { Settings as SettingsIcon, Plus, Edit, Trash2, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import settingsService from '../services/settingsService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [selectedKey, setSelectedKey] = useState('MONTHLY_FEE');
  
  const [settingForm, setSettingForm] = useState({
    settingKey: 'MONTHLY_FEE',
    settingValue: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    isActive: true,
    description: ''
  });

  // Fetch settings based on active tab
  const { data: settings, isLoading, refetch } = useQuery(
    ['settings', activeTab],
    () => {
      if (activeTab === 'current') return settingsService.getCurrentSettings();
      if (activeTab === 'future') return settingsService.getFutureSettings();
      return settingsService.getAllSettings();
    },
    { keepPreviousData: true }
  );

  // Fetch settings by key for history view
  const { data: keySettings, isLoading: keyLoading } = useQuery(
    ['settings-by-key', selectedKey],
    () => settingsService.getSettingsByKey(selectedKey),
    { enabled: activeTab === 'history' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const settingData = {
        ...settingForm,
        settingValue: settingForm.settingValue.toString(),
        effectiveTo: settingForm.effectiveTo || null
      };

      if (editingSetting) {
        await settingsService.updateSetting(editingSetting.id, settingData);
        toast.success('Setting updated successfully!');
      } else {
        await settingsService.createSetting(settingData);
        toast.success('Setting created successfully!');
      }
      
      setShowForm(false);
      setEditingSetting(null);
      resetForm();
      refetch();
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      toast.error('Failed to save setting: ' + errorMsg);
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setSettingForm({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue,
      effectiveFrom: setting.effectiveFrom,
      effectiveTo: setting.effectiveTo || '',
      isActive: setting.isActive,
      description: setting.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this setting? This action cannot be undone.')) {
      try {
        await settingsService.deleteSetting(id);
        toast.success('Setting deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete setting: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this setting?')) {
      try {
        await settingsService.deactivateSetting(id);
        toast.success('Setting deactivated successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to deactivate setting: ' + (error.response?.data || error.message));
      }
    }
  };

  const resetForm = () => {
    setSettingForm({
      settingKey: 'MONTHLY_FEE',
      settingValue: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      isActive: true,
      description: ''
    });
  };

  const handleInputChange = (field, value) => {
    setSettingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      CURRENT: 'bg-green-100 text-green-800',
      FUTURE: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getSettingKeyLabel = (key) => {
    const labels = {
      MONTHLY_FEE: 'Monthly Fee',
      ADMISSION_FEE: 'Admission Fee'
    };
    return labels[key] || key;
  };

  const renderSettingsTable = (settingsData) => {
    if (!settingsData || settingsData.length === 0) {
      return (
        <div className="text-center py-12">
          <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No settings found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Setting</th>
              <th className="table-header">Value</th>
              <th className="table-header">Effective From</th>
              <th className="table-header">Effective To</th>
              <th className="table-header">Status</th>
              <th className="table-header">Description</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {settingsData.map((setting) => (
              <tr key={setting.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">
                  {getSettingKeyLabel(setting.settingKey)}
                </td>
                <td className="table-cell">
                  <span className="text-lg font-semibold text-green-600">
                    ₹{parseFloat(setting.settingValue).toFixed(2)}
                  </span>
                </td>
                <td className="table-cell">
                  {new Date(setting.effectiveFrom).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  {setting.effectiveTo 
                    ? new Date(setting.effectiveTo).toLocaleDateString()
                    : <span className="text-gray-400">No end date</span>
                  }
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(setting.status)}`}>
                    {setting.status}
                  </span>
                </td>
                <td className="table-cell text-sm text-gray-600">
                  {setting.description || '-'}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    {setting.isActive && (
                      <button
                        onClick={() => handleDeactivate(setting.id)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Deactivate"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Settings</h1>
          <p className="text-gray-600">Manage gym fees and configuration with time-based validity</p>
        </div>
        <button
          onClick={() => {
            setEditingSetting(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Calendar className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Time-Based Configuration</h3>
            <p className="text-sm text-blue-700 mt-1">
              Settings have validity periods. You can plan future fee changes in advance, and the system will automatically use the correct fee based on the date.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DollarSign className="h-4 w-4 inline mr-2" />
            Current Settings
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'future'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Future Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <SettingsIcon className="h-4 w-4 inline mr-2" />
            History
          </button>
        </nav>
      </div>

      {/* Current & Future Settings Tabs */}
      {(activeTab === 'current' || activeTab === 'future') && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'current' ? 'Current Settings (Valid Today)' : 'Future Settings'}
          </h3>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            renderSettingsTable(settings)
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">View Setting History</h3>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Setting Type
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="input-field"
              >
                <option value="MONTHLY_FEE">Monthly Fee</option>
                <option value="ADMISSION_FEE">Admission Fee</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getSettingKeyLabel(selectedKey)} History
            </h3>
            {keyLoading ? (
              <LoadingSpinner />
            ) : (
              renderSettingsTable(keySettings)
            )}
          </div>
        </div>
      )}

      {/* Setting Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSetting ? 'Edit Setting' : 'Add New Setting'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setting Type
                </label>
                <select
                  required
                  value={settingForm.settingKey}
                  onChange={(e) => handleInputChange('settingKey', e.target.value)}
                  className="input-field"
                  disabled={editingSetting !== null}
                >
                  <option value="MONTHLY_FEE">Monthly Fee</option>
                  <option value="ADMISSION_FEE">Admission Fee</option>
                </select>
                {editingSetting && (
                  <p className="text-xs text-gray-500 mt-1">
                    Setting type cannot be changed when editing
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settingForm.settingValue}
                  onChange={(e) => handleInputChange('settingValue', e.target.value)}
                  className="input-field"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  required
                  value={settingForm.effectiveFrom}
                  onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date when this setting becomes active
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective To (Optional)
                </label>
                <input
                  type="date"
                  value={settingForm.effectiveTo}
                  onChange={(e) => handleInputChange('effectiveTo', e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for open-ended validity
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settingForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Optional description (e.g., 'Annual fee increase for 2025')"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={settingForm.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              {/* Warning for overlapping dates */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Make sure the date range doesn't overlap with existing settings for the same type. The system will reject overlapping dates.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingSetting ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSetting(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
