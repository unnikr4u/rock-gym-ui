import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Search, User, Phone, Calendar, Scale, Ruler, Droplets, DollarSign, Camera, X } from 'lucide-react';
import { useQuery } from 'react-query';
import { memberService } from '../services/memberService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const UpdateMember = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id');
  
  const [searchId, setSearchId] = useState(idFromUrl || '');
  const [selectedMemberId, setSelectedMemberId] = useState(idFromUrl ? parseInt(idFromUrl) : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
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
    expiryTo: '',
    paymentMode: ''
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
          expiryTo: member.expiryTo || '',
          paymentMode: member.paymentMode || ''
        });
        
        // Set existing photo if available
        if (member.photoUrl) {
          setExistingPhotoUrl(member.photoUrl);
        } else {
          setExistingPhotoUrl(null);
        }
        
        // Reset photo upload state
        setPhotoFile(null);
        setPhotoPreview(null);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
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

      await memberService.updateMember(selectedMemberId, memberData, photoFile);
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
              {/* Photo Upload */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Member Photo</h3>
                <div className="space-y-4">
                  {photoPreview || existingPhotoUrl ? (
                    <div className="relative">
                      <img
                        src={photoPreview || (existingPhotoUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:9090/rockgymapp'}/api/files/${existingPhotoUrl}` : '')}
                        alt="Member"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {!photoPreview && existingPhotoUrl && (
                        <div className="mt-2">
                          <label htmlFor="photo-upload" className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
                            Change photo
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={handlePhotoChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <span className="text-primary-600 hover:text-primary-700 font-medium">
                            Upload a photo
                          </span>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handlePhotoChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or GIF (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
                      Payment Mode
                    </label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode?.toUpperCase() || ''}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select payment mode</option>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                      <option value="BANK TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: This is for initial admission payment only
                    </p>
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