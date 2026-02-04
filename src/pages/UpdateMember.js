import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, User, Phone, Calendar, Scale, Ruler, Droplets, DollarSign } from 'lucide-react';
import { useQuery } from 'react-query';
import { memberService } from '../services/memberService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const UpdateMember = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    contactNo: '',
    doj: '',
    dob: '',
    gender: '',
    weight: '',
    height: '',
    bloodGroup: '',
    joiningFee: '',
    isAdmin: false,
    advanceInMonths: '',
    expiryFrom: '',
    expiryTo: ''
  });

  const { data: memberData, isLoading, error } = useQuery(
    ['member', selectedMemberId],
    () => memberService.getMemberById(selectedMemberId),
    {
      enabled: !!selectedMemberId,
      onSuccess: (data) => {
        const member = data.data;
        setFormData({
          id: member.id || '',
          name: member.name || '',
          contactNo: member.contactNo || '',
          doj: member.doj || '',
          dob: member.dob || '',
          gender: member.gender || '',
          weight: member.weight || '',
          height: member.height || '',
          bloodGroup: member.bloodGroup || '',
          joiningFee: member.joiningFee || '',
          isAdmin: member.isAdmin || false,
          advanceInMonths: member.advanceInMonths || '',
          expiryFrom: member.expiryFrom || '',
          expiryTo: member.expiryTo || ''
        });
      }
    }
  );

  const handleSearch = () => {
    if (!searchId) {
      toast.error('Please enter a member ID');
      return;
    }
    setSelectedMemberId(searchId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMemberId) {
      toast.error('Please search and select a member first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form data to proper types
      const memberData = {
        ...formData,
        id: parseInt(formData.id),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        joiningFee: parseFloat(formData.joiningFee),
        advanceInMonths: formData.advanceInMonths ? parseInt(formData.advanceInMonths) : null,
        dob: formData.dob || null
      };

      await memberService.updateMember(selectedMemberId, memberData);
      toast.success('Member updated successfully!');
      navigate('/members');
    } catch (error) {
      toast.error('Failed to update member: ' + (error.response?.data || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/members?tab=manage" className="btn-secondary flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Manage Members
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Member</h1>
          <p className="text-gray-600">Search and update existing member information</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Member</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member ID
            </label>
            <input
              type="number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="input-field"
              placeholder="Enter member ID to search"
            />
          </div>
          <div className="flex-shrink-0 pt-6">
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-red-600">Member not found or error loading member data</p>
            <p className="text-sm text-gray-500 mt-2">Please check the member ID and try again</p>
          </div>
        </div>
      )}

      {/* Update Form */}
      {selectedMemberId && memberData && !isLoading && !error && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member ID
                    </label>
                    <input
                      type="number"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      className="input-field bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Joining
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        name="doj"
                        value={formData.doj}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Information */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                        placeholder="Enter weight"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.1"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                        placeholder="Enter height"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Details */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joining Fee
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="joiningFee"
                        value={formData.joiningFee}
                        onChange={handleInputChange}
                        className="pl-10 input-field"
                        placeholder="Enter joining fee"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Payment (Months)
                    </label>
                    <input
                      type="number"
                      name="advanceInMonths"
                      value={formData.advanceInMonths}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Number of months paid in advance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership From
                    </label>
                    <input
                      type="date"
                      name="expiryFrom"
                      value={formData.expiryFrom}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership To
                    </label>
                    <input
                      type="date"
                      name="expiryTo"
                      value={formData.expiryTo}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Admin Member
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Updating...' : 'Update Member'}
                  </button>
                  
                  <Link
                    to="/members?tab=manage"
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateMember;