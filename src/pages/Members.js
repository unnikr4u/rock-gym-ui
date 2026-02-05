import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Upload, Search, Filter, Eye, ArrowUpDown, Users, Settings, Plus, Edit } from 'lucide-react';
import { memberService } from '../services/memberService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';

const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'view');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  
  // File upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Access file upload states
  const [accessFile, setAccessFile] = useState(null);
  const [uploadingAccess, setUploadingAccess] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: allMembers, isLoading: loadingAll, refetch: refetchAll } = useQuery(
    ['allMembers', currentPage, pageSize, sortBy, sortDir, debouncedSearchTerm],
    () => memberService.getAllMembers(currentPage, pageSize, sortBy, sortDir, false, debouncedSearchTerm),
    { enabled: activeTab === 'view' && filter === 'all', keepPreviousData: true }
  );

  const { data: adminMembers, isLoading: loadingAdmins, refetch: refetchAdmins } = useQuery(
    ['adminMembers', currentPage, pageSize, sortBy, sortDir, debouncedSearchTerm],
    () => memberService.getAdminMembers(currentPage, pageSize, sortBy, sortDir, debouncedSearchTerm),
    { enabled: activeTab === 'view' && filter === 'admins', keepPreviousData: true }
  );

  const { data: paidMembers, isLoading: loadingPaid, refetch: refetchPaid } = useQuery(
    'paidMembers',
    () => memberService.getPaidMembers(),
    { enabled: activeTab === 'view' && filter === 'paid' }
  );

  const { data: unpaidMembers, isLoading: loadingUnpaid, refetch: refetchUnpaid } = useQuery(
    'unpaidMembers',
    () => memberService.getUnpaidMembers(),
    { enabled: activeTab === 'view' && filter === 'unpaid' }
  );

  const { data: unattendedMembers, isLoading: loadingUnattended, refetch: refetchUnattended } = useQuery(
    ['unattendedMembers', currentPage, pageSize, sortBy, sortDir],
    () => memberService.getUnattendedMembersPaginated(currentPage, pageSize, sortBy, sortDir),
    { enabled: activeTab === 'view' && filter === 'unattended', keepPreviousData: true }
  );

  const { data: activeMembers, isLoading: loadingActive, refetch: refetchActive } = useQuery(
    ['activeMembers', currentPage, pageSize, sortBy, sortDir, debouncedSearchTerm],
    () => memberService.getActiveMembersPaginated(currentPage, pageSize, sortBy, sortDir, debouncedSearchTerm),
    { enabled: activeTab === 'view' && filter === 'active', keepPreviousData: true }
  );

  const getCurrentData = () => {
    switch (filter) {
      case 'paid':
        return paidMembers?.data?.list || [];
      case 'unpaid':
        return unpaidMembers?.data?.list || [];
      case 'unattended':
        return unattendedMembers?.data?.content || [];
      case 'active':
        return activeMembers?.data?.content || [];
      case 'admins':
        return adminMembers?.data?.content || [];
      default:
        return allMembers?.data?.content || [];
    }
  };

  const getPaginationData = () => {
    if (filter === 'all' && allMembers?.data) {
      return {
        totalElements: allMembers.data.totalElements,
        totalPages: allMembers.data.totalPages,
        currentPage: allMembers.data.number,
        pageSize: allMembers.data.size
      };
    }
    if (filter === 'admins' && adminMembers?.data) {
      return {
        totalElements: adminMembers.data.totalElements,
        totalPages: adminMembers.data.totalPages,
        currentPage: adminMembers.data.number,
        pageSize: adminMembers.data.size
      };
    }
    if (filter === 'unattended' && unattendedMembers?.data) {
      return {
        totalElements: unattendedMembers.data.totalElements,
        totalPages: unattendedMembers.data.totalPages,
        currentPage: unattendedMembers.data.number,
        pageSize: unattendedMembers.data.size
      };
    }
    if (filter === 'active' && activeMembers?.data) {
      return {
        totalElements: activeMembers.data.totalElements,
        totalPages: activeMembers.data.totalPages,
        currentPage: activeMembers.data.number,
        pageSize: activeMembers.data.size
      };
    }
    return null;
  };

  const isLoading = loadingAll || loadingPaid || loadingUnpaid || loadingUnattended || loadingActive || loadingAdmins;
  const members = getCurrentData();

  // For paginated results (all, admins, unattended, active), use the data directly from backend
  // For non-paginated results (paid, unpaid), apply client-side filtering
  const displayMembers = (filter === 'all' || filter === 'admins' || filter === 'unattended' || filter === 'active') 
    ? members 
    : members.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id?.toString().includes(searchTerm)
      );

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page when filter changes
    const params = new URLSearchParams();
    if (activeTab !== 'view') params.set('tab', activeTab);
    if (newFilter !== 'all') params.set('filter', newFilter);
    setSearchParams(params);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (tab !== 'view') params.set('tab', tab);
    if (filter !== 'all') params.set('filter', filter);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when page size changes
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await memberService.uploadMembers(uploadFile);
      toast.success('Members uploaded successfully!');
      setUploadFile(null);
      // Refetch data
      refetchAll();
      refetchPaid();
      refetchUnpaid();
      refetchUnattended();
      refetchActive();
      refetchAdmins();
    } catch (error) {
      toast.error('Failed to upload members: ' + (error.response?.data || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAccessFileUpload = async () => {
    if (!accessFile) {
      toast.error('Please select an access file to upload');
      return;
    }

    setUploadingAccess(true);
    try {
      await memberService.uploadAccessFile(accessFile);
      toast.success('Access dates updated successfully!');
      setAccessFile(null);
      // Refetch data
      refetchAll();
      refetchPaid();
      refetchUnpaid();
      refetchUnattended();
      refetchActive();
      refetchAdmins();
    } catch (error) {
      toast.error('Failed to upload access file: ' + (error.response?.data || error.message));
    } finally {
      setUploadingAccess(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage gym members and their information</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            View Members
          </button>
          <button
            onClick={() => handleTabChange('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Manage Members
          </button>
        </nav>
      </div>

      {/* View Members Tab */}
      {activeTab === 'view' && (
        <>
          {/* Filters and Search */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Members' },
                    { key: 'paid', label: 'Paid' },
                    { key: 'unpaid', label: 'Unpaid' },
                    { key: 'unattended', label: 'Unattended' },
                    { key: 'active', label: 'Active' },
                    { key: 'admins', label: 'Admins' },
                  ].map((filterOption) => (
                    <button
                      key={filterOption.key}
                      onClick={() => handleFilterChange(filterOption.key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === filterOption.key
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field w-64"
                />
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th 
                      className="table-header cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ID</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Contact</th>
                    <th 
                      className="table-header cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('doj')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>DOJ</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expiryFrom')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{filter === 'active' ? 'Expiry From' : 'Expiry From'}</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="table-header cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expiryTo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{filter === 'active' ? 'Expiry To' : 'Expiry To'}</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayMembers.map((member) => (
                    <tr key={member.id || member.employeeId} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{member.id || member.employeeId}</td>
                      <td className="table-cell">{member.name || member.employeeName}</td>
                      <td className="table-cell">{member.contactNo}</td>
                      <td className="table-cell">
                        {member.doj ? new Date(member.doj).toLocaleDateString() : '-'}
                      </td>
                      <td className="table-cell">
                        {member.expiryFrom ? new Date(member.expiryFrom).toLocaleDateString() : '-'}
                      </td>
                      <td className="table-cell">
                        {member.expiryTo ? new Date(member.expiryTo).toLocaleDateString() : '-'}
                      </td>
                      <td className="table-cell">
                        {filter === 'active' ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active (Valid Membership)
                          </span>
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.expiryTo && new Date(member.expiryTo) >= new Date()
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {member.expiryTo && new Date(member.expiryTo) >= new Date() ? 'Active' : 'Expired'}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <Link
                          to={`/members/${member.id || member.employeeId}`}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {displayMembers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No members found</p>
                </div>
              )}
            </div>
            
            {/* Pagination - show for 'all', 'admins', 'unattended', and 'active' filters */}
            {(() => {
              const paginationData = (filter === 'all' || filter === 'admins' || filter === 'unattended' || filter === 'active') ? getPaginationData() : null;
              return paginationData && (
                <Pagination
                  currentPage={paginationData.currentPage}
                  totalPages={paginationData.totalPages}
                  totalElements={paginationData.totalElements}
                  pageSize={paginationData.pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              );
            })()}
          </div>
        </>
      )}

      {/* Manage Members Tab */}
      {activeTab === 'manage' && (
        <>
          {/* Upload Members Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-500" />
              Upload Members from Excel
            </h3>
            <p className="text-gray-600 mb-6">
              Upload an Excel file to create or update multiple member records at once.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="member-upload"
                />
                <label
                  htmlFor="member-upload"
                  className="btn-secondary cursor-pointer flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Excel File
                </label>
                {uploadFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{uploadFile.name}</span>
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading}
                      className="btn-primary"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
              </div>
              
              {uploadFile && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">File Selected:</h4>
                  <p className="text-sm text-blue-700">{uploadFile.name}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Click "Upload" to process the file and create/update member records.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Access Dates Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-purple-500" />
              Update Member Access Dates
            </h3>
            <p className="text-gray-600 mb-6">
              Upload an Excel file to update membership expiry dates for existing members.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setAccessFile(e.target.files[0])}
                  className="hidden"
                  id="access-upload"
                />
                <label
                  htmlFor="access-upload"
                  className="btn-secondary cursor-pointer flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Access File
                </label>
                {accessFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{accessFile.name}</span>
                    <button
                      onClick={handleAccessFileUpload}
                      disabled={uploadingAccess}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {uploadingAccess ? 'Updating...' : 'Update Access Dates'}
                    </button>
                  </div>
                )}
              </div>
              
              {accessFile && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Access File Selected:</h4>
                  <p className="text-sm text-purple-700">{accessFile.name}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Click "Update Access Dates" to process the file and update member expiry dates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Create/Update/Delete Member Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-500" />
                Create New Member
              </h3>
              <p className="text-gray-600 mb-6">
                Add a new member to the system manually.
              </p>
              <Link 
                to="/members/create"
                className="btn-primary w-full flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Member
              </Link>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-orange-500" />
                Update Member
              </h3>
              <p className="text-gray-600 mb-6">
                Search and update existing member information.
              </p>
              <Link 
                to="/members/update"
                className="btn-secondary w-full flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search & Update
              </Link>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-red-500" />
                Delete Member
              </h3>
              <p className="text-gray-600 mb-6">
                Search and delete existing member from the system.
              </p>
              <Link 
                to="/members/delete"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search & Delete
              </Link>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Member Excel File Format:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>The Excel file should contain columns for member information</li>
                  <li>Required fields: ID, Name, Contact Number, Date of Joining</li>
                  <li>Optional fields: Date of Birth, Weight, Height, Blood Group</li>
                  <li>The system will create new members or update existing ones based on ID</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Access Dates Excel File Format:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>The Excel file should contain member access/expiry date information</li>
                  <li>Required fields: Member ID, Expiry From Date, Expiry To Date</li>
                  <li>The system will update existing members' membership dates based on ID</li>
                  <li>Only existing members will be updated - new members won't be created</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported File Types:</h4>
                <p className="text-sm text-gray-600">
                  .xlsx, .xls (Microsoft Excel files)
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Members;