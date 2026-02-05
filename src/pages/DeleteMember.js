import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Search, User, Phone, Calendar, AlertTriangle } from 'lucide-react';
import { useQuery } from 'react-query';
import { memberService } from '../services/memberService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const DeleteMember = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: memberData, isLoading, error } = useQuery(
    ['member', selectedMemberId],
    () => memberService.getMemberById(selectedMemberId),
    {
      enabled: !!selectedMemberId
    }
  );

  const handleSearch = () => {
    if (!searchId) {
      toast.error('Please enter a member ID');
      return;
    }
    setSelectedMemberId(searchId);
    setShowConfirmation(false);
  };

  const handleDeleteConfirm = () => {
    setShowConfirmation(true);
  };

  const handleDeleteCancel = () => {
    setShowConfirmation(false);
  };

  const handleDelete = async () => {
    if (!selectedMemberId) {
      toast.error('Please search and select a member first');
      return;
    }

    setIsDeleting(true);
    try {
      await memberService.deleteMember(selectedMemberId);
      toast.success('Member deleted successfully!');
      navigate('/members?tab=manage');
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      toast.error('Failed to delete member: ' + errorMessage);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const member = memberData?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/members?tab=manage" className="btn-secondary flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Manage Members
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delete Member</h1>
          <p className="text-gray-600">Search and delete existing member from the system</p>
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

      {/* Member Details and Delete Section */}
      {selectedMemberId && memberData && !isLoading && !error && (
        <div className="space-y-6">
          {/* Member Information Display */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="font-medium">{member.id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{member.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium">{member.contactNo}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Joining</p>
                  <p className="font-medium">
                    {member.doj ? new Date(member.doj).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Membership Status</p>
                  <p className={`font-medium ${
                    member.expiryTo && new Date(member.expiryTo) >= new Date()
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {member.expiryTo && new Date(member.expiryTo) >= new Date() ? 'Active' : 'Expired'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Type</p>
                  <p className="font-medium">{member.isAdmin ? 'Admin' : 'Regular Member'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning and Delete Section */}
          <div className="card border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900 mb-2">Delete Member</h3>
                <div className="space-y-2 text-sm text-red-800">
                  <p>⚠️ This action will permanently delete the member and ALL associated records from the system.</p>
                  <p>⚠️ This includes: payment records, punch/attendance records, and member information.</p>
                  <p>⚠️ This action cannot be undone.</p>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  {!showConfirmation ? (
                    <button
                      onClick={handleDeleteConfirm}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Member
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-medium text-red-900">
                        Are you sure you want to delete "{member.name}"?
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          disabled={isDeleting}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteMember;