import React, { useState, useEffect } from 'react';
import { Upload, Search, Calendar, User, Clock, AlertTriangle, CheckCircle, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { attendanceService } from '../services/attendanceService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Attendance = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const filterParam = searchParams.get('filter');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'search'); // 'search', 'inactive', or 'active'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Filter states for search tab
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthYear, setMonthYear] = useState('');
  const [year, setYear] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  // Results and pagination state for search tab
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // States for inactive members tab
  const [activeInactiveFilter, setActiveInactiveFilter] = useState(null);
  const [inactiveCurrentPage, setInactiveCurrentPage] = useState(0);
  const [inactivePageSize, setInactivePageSize] = useState(10);
  const [inactiveTotalElements, setInactiveTotalElements] = useState(0);
  const [inactiveTotalPages, setInactiveTotalPages] = useState(0);
  const [inactiveResults, setInactiveResults] = useState(null);
  const [isInactiveLoading, setIsInactiveLoading] = useState(false);

  // States for active members tab
  const [activeActiveFilter, setActiveActiveFilter] = useState(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState(0);
  const [activePageSize, setActivePageSize] = useState(10);
  const [activeTotalElements, setActiveTotalElements] = useState(0);
  const [activeTotalPages, setActiveTotalPages] = useState(0);
  const [activeResults, setActiveResults] = useState(null);
  const [isActiveLoading, setIsActiveLoading] = useState(false);

  // Handle URL parameters on component mount
  useEffect(() => {
    if (tabParam === 'inactive' && filterParam) {
      // Auto-trigger the filter based on URL parameter
      setTimeout(() => {
        handleInactiveFilter(filterParam);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam, filterParam]);

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await attendanceService.uploadPunchData(uploadFile);
      toast.success('Punch data uploaded successfully!');
      setUploadFile(null);
    } catch (error) {
      toast.error('Failed to upload punch data: ' + (error.response?.data || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (page = 0) => {
    if (!selectedDate && !monthYear && !year && !employeeName && !employeeId) {
      toast.error('Please select at least one filter');
      return;
    }

    setIsSearching(true);
    setActiveInactiveFilter(null);
    
    try {
      let results = [];
      let paginationData = null;
      
      // Ensure page and pageSize are numbers
      const pageNum = typeof page === 'number' ? page : parseInt(page) || 0;
      const sizeNum = typeof pageSize === 'number' ? pageSize : parseInt(pageSize) || 10;
      
      if (monthYear) {
        // Use paginated endpoint for month/year search
        const punchData = await attendanceService.getPunchDetailsByMonthYearPaginated(monthYear, pageNum, sizeNum, 'logDateTime', 'desc');
        results = punchData.data?.content || [];
        paginationData = {
          totalElements: punchData.data?.totalElements || 0,
          totalPages: punchData.data?.totalPages || 0,
          currentPage: punchData.data?.number || 0,
          pageSize: punchData.data?.size || sizeNum
        };
      } else if (year) {
        // Use paginated endpoint for year-only search
        const punchData = await attendanceService.getPunchDetailsByYearPaginated(year, pageNum, sizeNum, 'logDateTime', 'desc');
        results = punchData.data?.content || [];
        paginationData = {
          totalElements: punchData.data?.totalElements || 0,
          totalPages: punchData.data?.totalPages || 0,
          currentPage: punchData.data?.number || 0,
          pageSize: punchData.data?.size || sizeNum
        };
      } else {
        // Use paginated endpoint for other searches
        const searchParams = {
          page: pageNum,
          size: sizeNum,
          sortBy: 'logDateTime',
          sortDir: 'desc'
        };
        
        if (employeeId) searchParams.employeeId = parseInt(employeeId);
        if (employeeName) searchParams.employeeName = employeeName;
        if (selectedDate) searchParams.date = selectedDate.toISOString().split('T')[0];
        
        const punchData = await attendanceService.getPunchDetailsOptimizedPaginated(searchParams);
        results = punchData.data?.content || [];
        paginationData = {
          totalElements: punchData.data?.totalElements || 0,
          totalPages: punchData.data?.totalPages || 0,
          currentPage: punchData.data?.number || 0,
          pageSize: punchData.data?.size || sizeNum
        };
      }
      
      setSearchResults(results);
      if (paginationData) {
        setTotalElements(paginationData.totalElements);
        setTotalPages(paginationData.totalPages);
        setCurrentPage(paginationData.currentPage);
      }
    } catch (error) {
      toast.error('Search failed: ' + (error.response?.data || error.message));
      setSearchResults([]);
      setTotalElements(0);
      setTotalPages(0);
      setCurrentPage(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInactiveFilter = async (type, page = 0) => {
    setActiveInactiveFilter(type);
    setIsInactiveLoading(true);
    
    try {
      let response;
      switch (type) {
        case '7days':
          response = await attendanceService.getInactiveLast7DaysPaginated(page, inactivePageSize);
          break;
        case '15days':
          response = await attendanceService.getInactiveLast15DaysPaginated(page, inactivePageSize);
          break;
        case '30days':
          response = await attendanceService.getInactiveLast30DaysPaginated(page, inactivePageSize);
          break;
        case '60days':
          response = await attendanceService.getInactiveLast60DaysPaginated(page, inactivePageSize);
          break;
        default:
          return;
      }
      
      if (response?.data) {
        setInactiveResults(response.data);
        setInactiveTotalElements(response.data.count || 0);
        setInactiveTotalPages(response.data.totalPages || 0);
        setInactiveCurrentPage(response.data.pageNumber || 0);
      }
    } catch (error) {
      toast.error('Failed to load inactive members: ' + (error.response?.data || error.message));
      setInactiveResults(null);
    } finally {
      setIsInactiveLoading(false);
    }
  };

  const handleActiveFilter = async (type, page = 0) => {
    setActiveActiveFilter(type);
    setIsActiveLoading(true);
    
    try {
      let response;
      switch (type) {
        case 'today':
          response = await attendanceService.getActiveTodayPaginated(page, activePageSize);
          break;
        case '7days':
          response = await attendanceService.getActiveLast7DaysPaginated(page, activePageSize);
          break;
        case '30days':
          response = await attendanceService.getActiveLast30DaysPaginated(page, activePageSize);
          break;
        case 'thismonth':
          response = await attendanceService.getActiveThisMonthPaginated(page, activePageSize);
          break;
        default:
          return;
      }
      
      if (response?.data) {
        setActiveResults(response.data);
        setActiveTotalElements(response.data.count || 0);
        setActiveTotalPages(response.data.totalPages || 0);
        setActiveCurrentPage(response.data.pageNumber || 0);
      }
    } catch (error) {
      toast.error('Failed to load active members: ' + (error.response?.data || error.message));
      setActiveResults(null);
    } finally {
      setIsActiveLoading(false);
    }
  };

  const clearFilters = () => {
    if (activeTab === 'search') {
      setSelectedDate(null);
      setMonthYear('');
      setYear('');
      setEmployeeName('');
      setEmployeeId('');
      setSearchResults(null);
      setCurrentPage(0);
      setTotalElements(0);
      setTotalPages(0);
    } else if (activeTab === 'inactive') {
      setActiveInactiveFilter(null);
      setInactiveResults(null);
      setInactiveCurrentPage(0);
      setInactiveTotalElements(0);
      setInactiveTotalPages(0);
    } else if (activeTab === 'active') {
      setActiveActiveFilter(null);
      setActiveResults(null);
      setActiveCurrentPage(0);
      setActiveTotalElements(0);
      setActiveTotalPages(0);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear results when switching tabs
    if (tab === 'search') {
      setActiveInactiveFilter(null);
      setInactiveResults(null);
      setActiveActiveFilter(null);
      setActiveResults(null);
    } else if (tab === 'inactive') {
      setSearchResults(null);
      setActiveActiveFilter(null);
      setActiveResults(null);
    } else if (tab === 'active') {
      setSearchResults(null);
      setActiveInactiveFilter(null);
      setInactiveResults(null);
    }
  };

  const handlePageChange = (page) => {
    const pageNum = typeof page === 'number' ? page : parseInt(page) || 0;
    setCurrentPage(pageNum);
    handleSearch(pageNum);
  };

  const handlePageSizeChange = (size) => {
    const sizeNum = typeof size === 'number' ? size : parseInt(size) || 10;
    setPageSize(sizeNum);
    setCurrentPage(0);
    handleSearch(0);
  };

  const handleInactivePageChange = (page) => {
    const pageNum = typeof page === 'number' ? page : parseInt(page) || 0;
    setInactiveCurrentPage(pageNum);
    handleInactiveFilter(activeInactiveFilter, pageNum);
  };

  const handleInactivePageSizeChange = (size) => {
    const sizeNum = typeof size === 'number' ? size : parseInt(size) || 10;
    setInactivePageSize(sizeNum);
    setInactiveCurrentPage(0);
    handleInactiveFilter(activeInactiveFilter, 0);
  };

  // Export functions
  // eslint-disable-next-line no-unused-vars
  const handleExportToExcel = async (days) => {
    try {
      const response = await attendanceService.exportInactiveMembersToExcel(days);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inactive_members_${days}_days.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export to Excel: ' + (error.response?.data || error.message));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleExportToPdf = async (days) => {
    try {
      const response = await attendanceService.exportInactiveMembersToPdf(days);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inactive_members_${days}_days.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export to PDF: ' + (error.response?.data || error.message));
    }
  };

  const handleActivePageChange = (page) => {
    const pageNum = typeof page === 'number' ? page : parseInt(page) || 0;
    setActiveCurrentPage(pageNum);
    handleActiveFilter(activeActiveFilter, pageNum);
  };

  const handleActivePageSizeChange = (size) => {
    const sizeNum = typeof size === 'number' ? size : parseInt(size) || 10;
    setActivePageSize(sizeNum);
    setActiveCurrentPage(0);
    handleActiveFilter(activeActiveFilter, 0);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Search attendance records and track inactive members</p>
        </div>
        
        {/* Upload Section - Only show on search tab */}
        {activeTab === 'search' && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="hidden"
                id="punch-upload"
              />
              <label
                htmlFor="punch-upload"
                className="btn-secondary cursor-pointer flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Punch File
              </label>
              {uploadFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Search Attendance Records
          </button>
          <button
            onClick={() => handleTabChange('inactive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inactive'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Inactive Members
          </button>
          <button
            onClick={() => handleTabChange('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Active Members
          </button>
        </nav>
      </div>

      {/* Search Tab Content */}
      {activeTab === 'search' && (
        <>
          {/* Search Filters */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Search Attendance Records</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Select Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  dateFormat="yyyy-MM-dd"
                  className="input-field"
                  placeholderText="Select date"
                  isClearable
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label>
                <input
                  type="text"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  placeholder="MM/yyyy (e.g., 02/2026)"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="yyyy (e.g., 2026)"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID"
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn-primary flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
              
              {isSearching ? (
                <LoadingSpinner />
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Employee Name</th>
                          <th className="table-header">Punch Time</th>
                          <th className="table-header">Date</th>
                          <th className="table-header">Time</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {searchResults?.map((punch, index) => (
                          <tr key={`search-${punch.punchId || punch.id || index}`} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">{punch.employeeId}</td>
                            <td className="table-cell">{punch.employeeName || '-'}</td>
                            <td className="table-cell">
                              {new Date(punch.logDateTime).toLocaleString()}
                            </td>
                            <td className="table-cell">
                              {new Date(punch.logDateTime).toLocaleDateString()}
                            </td>
                            <td className="table-cell">
                              <span className="text-sm text-gray-600">
                                {new Date(punch.logDateTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </td>
                            <td className="table-cell">
                              <Link
                                to={`/members/${punch.employeeId}`}
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
                    
                    {/* Empty state */}
                    {searchResults && searchResults.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No records found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Search Results</p>
                    <p className="text-lg font-medium text-gray-900">
                      {totalElements || searchResults?.length || 0} punch records
                    </p>
                  </div>
                  {totalPages > 1 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Page</p>
                      <p className="text-lg font-medium text-gray-900">
                        {currentPage + 1} of {totalPages}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination for search results */}
              {searchResults && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Inactive Members Tab Content */}
      {activeTab === 'inactive' && (
        <>
          {/* Inactive Members Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Inactive Members
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => handleInactiveFilter('7days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeInactiveFilter === '7days'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 7 Days</h4>
                  <p className="text-sm text-gray-600">Not punched in a week</p>
                </div>
              </button>
              
              <button
                onClick={() => handleInactiveFilter('15days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeInactiveFilter === '15days'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <div className="text-center">
                  <Clock className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 15 Days</h4>
                  <p className="text-sm text-gray-600">Not punched in 2 weeks</p>
                </div>
              </button>
              
              <button
                onClick={() => handleInactiveFilter('30days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeInactiveFilter === '30days'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 30 Days</h4>
                  <p className="text-sm text-gray-600">Not punched in a month</p>
                </div>
              </button>
              
              <button
                onClick={() => handleInactiveFilter('60days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeInactiveFilter === '60days'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <div className="text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 60 Days</h4>
                  <p className="text-sm text-gray-600">Not punched in 2 months</p>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Selection
              </button>
              
              {/* Export buttons - only show when there are results */}
              {activeInactiveFilter && inactiveResults && inactiveResults.employees?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Export:</span>
                  <button
                    onClick={() => handleExportToExcel(activeInactiveFilter === '7days' ? 7 : 
                                                      activeInactiveFilter === '15days' ? 15 : 
                                                      activeInactiveFilter === '30days' ? 30 : 60)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleExportToPdf(activeInactiveFilter === '7days' ? 7 : 
                                                    activeInactiveFilter === '15days' ? 15 : 
                                                    activeInactiveFilter === '30days' ? 30 : 60)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inactive Members Results */}
          {inactiveResults && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inactive Members</h3>
              
              {isInactiveLoading ? (
                <LoadingSpinner />
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Name</th>
                          <th className="table-header">DOJ</th>
                          <th className="table-header">Last Punch</th>
                          <th className="table-header">Inactive Days</th>
                          <th className="table-header">Contact</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inactiveResults?.employees?.map((employee, index) => (
                          <tr key={`inactive-${employee.employeeId}-${index}`} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">{employee.employeeId}</td>
                            <td className="table-cell">{employee.employeeName}</td>
                            <td className="table-cell">
                              {employee.doj ? new Date(employee.doj).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">
                              {employee.lastPunchDate 
                                ? new Date(employee.lastPunchDate).toLocaleString()
                                : 'Never punched'
                              }
                            </td>
                            <td className="table-cell">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                employee.inactiveDaysSinceLastPunch > 30
                                  ? 'bg-red-100 text-red-800'
                                  : employee.inactiveDaysSinceLastPunch > 7
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {employee.inactiveDaysSinceLastPunch || 0} days
                              </span>
                            </td>
                            <td className="table-cell">{employee.contactNo || '-'}</td>
                            <td className="table-cell">
                              <Link
                                to={`/members/${employee.employeeId}`}
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
                    
                    {/* Empty state */}
                    {inactiveResults && inactiveResults.employees?.length === 0 && (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No inactive members found</p>
                        <p className="text-sm text-gray-400">
                          No inactive members found for the selected period
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive Members</p>
                    <p className="text-lg font-medium text-gray-900">
                      {inactiveTotalElements || 0} members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-medium text-gray-900">
                      Last {inactiveResults?.inactiveDays || 0} days
                    </p>
                  </div>
                  {inactiveTotalPages > 1 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Page</p>
                      <p className="text-lg font-medium text-gray-900">
                        {inactiveCurrentPage + 1} of {inactiveTotalPages}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination for inactive members */}
              {inactiveResults && inactiveTotalPages > 1 && (
                <Pagination
                  currentPage={inactiveCurrentPage}
                  totalPages={inactiveTotalPages}
                  totalElements={inactiveTotalElements}
                  pageSize={inactivePageSize}
                  onPageChange={handleInactivePageChange}
                  onPageSizeChange={handleInactivePageSizeChange}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Active Members Tab Content */}
      {activeTab === 'active' && (
        <>
          {/* Active Members Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Active Members
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => handleActiveFilter('today')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeActiveFilter === 'today'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Today</h4>
                  <p className="text-sm text-gray-600">Punched today</p>
                </div>
              </button>
              
              <button
                onClick={() => handleActiveFilter('7days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeActiveFilter === '7days'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 7 Days</h4>
                  <p className="text-sm text-gray-600">Punched this week</p>
                </div>
              </button>
              
              <button
                onClick={() => handleActiveFilter('30days')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeActiveFilter === '30days'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Last 30 Days</h4>
                  <p className="text-sm text-gray-600">Punched this month</p>
                </div>
              </button>
              
              <button
                onClick={() => handleActiveFilter('thismonth')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeActiveFilter === 'thismonth'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">This Month</h4>
                  <p className="text-sm text-gray-600">Punched in current month</p>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Active Members Results */}
          {activeResults && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Members</h3>
              
              {isActiveLoading ? (
                <LoadingSpinner />
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Name</th>
                          <th className="table-header">DOJ</th>
                          <th className="table-header">Last Punch</th>
                          <th className="table-header">Days Since Last Punch</th>
                          <th className="table-header">Contact</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeResults?.employees?.map((employee, index) => (
                          <tr key={`active-${employee.employeeId}-${index}`} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">{employee.employeeId}</td>
                            <td className="table-cell">{employee.employeeName}</td>
                            <td className="table-cell">
                              {employee.doj ? new Date(employee.doj).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">
                              {employee.lastPunchDate 
                                ? new Date(employee.lastPunchDate).toLocaleString()
                                : 'No punch record'
                              }
                            </td>
                            <td className="table-cell">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                employee.inactiveDaysSinceLastPunch === 0
                                  ? 'bg-green-100 text-green-800'
                                  : employee.inactiveDaysSinceLastPunch <= 3
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {employee.inactiveDaysSinceLastPunch || 0} days
                              </span>
                            </td>
                            <td className="table-cell">{employee.contactNo || '-'}</td>
                            <td className="table-cell">
                              <Link
                                to={`/members/${employee.employeeId}`}
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
                    
                    {/* Empty state */}
                    {activeResults && activeResults.employees?.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No active members found</p>
                        <p className="text-sm text-gray-400">
                          No active members found for the selected period
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-lg font-medium text-gray-900">
                      {activeTotalElements || 0} members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-medium text-gray-900">
                      {activeActiveFilter === 'today' ? 'Today' : 
                       activeActiveFilter === '7days' ? 'Last 7 days' :
                       activeActiveFilter === '30days' ? 'Last 30 days' :
                       activeActiveFilter === 'thismonth' ? 'This month' : '-'}
                    </p>
                  </div>
                  {activeTotalPages > 1 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Page</p>
                      <p className="text-lg font-medium text-gray-900">
                        {activeCurrentPage + 1} of {activeTotalPages}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination for active members */}
              {activeResults && activeTotalPages > 1 && (
                <Pagination
                  currentPage={activeCurrentPage}
                  totalPages={activeTotalPages}
                  totalElements={activeTotalElements}
                  pageSize={activePageSize}
                  onPageChange={handleActivePageChange}
                  onPageSizeChange={handleActivePageSizeChange}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;