import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart3, Calendar, Users, Clock, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { attendanceService } from '../services/attendanceService';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateMonthYear, setDateMonthYear] = useState('11/2025');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [inactiveDays, setInactiveDays] = useState(30);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data: attendanceReport, isLoading: loadingAttendance, refetch: refetchAttendance } = useQuery(
    ['attendanceReport', dateMonthYear, page, size],
    () => attendanceService.getAttendanceReport({
      dateMonthYear,
      page,
      size
    }),
    { enabled: reportType === 'attendance' }
  );

  const { data: lastPunchReport, isLoading: loadingLastPunch, refetch: refetchLastPunch } = useQuery(
    ['lastPunchReport', fromDate, toDate],
    () => attendanceService.getEmployeeLastPunch({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    }),
    { enabled: reportType === 'lastPunch' }
  );

  const { data: noPunchReport, isLoading: loadingNoPunch, refetch: refetchNoPunch } = useQuery(
    ['noPunchReport', fromDate, toDate],
    () => attendanceService.getEmployeesWithoutPunch({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    }),
    { enabled: reportType === 'noPunch' }
  );

  const { data: inactiveReport, isLoading: loadingInactive, refetch: refetchInactive } = useQuery(
    ['inactiveReport', inactiveDays],
    () => attendanceService.getInactiveEmployees({ inactiveDays }),
    { enabled: reportType === 'inactive' }
  );

  const { data: last7DaysReport, isLoading: loadingLast7Days, refetch: refetchLast7Days } = useQuery(
    'last7DaysReport',
    () => attendanceService.getInactiveLast7Days(),
    { enabled: reportType === 'last7Days' }
  );

  const handleGenerateReport = () => {
    switch (reportType) {
      case 'attendance':
        refetchAttendance();
        break;
      case 'lastPunch':
        refetchLastPunch();
        break;
      case 'noPunch':
        refetchNoPunch();
        break;
      case 'inactive':
        refetchInactive();
        break;
      case 'last7Days':
        refetchLast7Days();
        break;
      default:
        break;
    }
  };

  const getCurrentData = () => {
    switch (reportType) {
      case 'attendance':
        return attendanceReport?.data?.result || [];
      case 'lastPunch':
        return lastPunchReport?.data?.employees || [];
      case 'noPunch':
        return noPunchReport?.data?.employees || [];
      case 'inactive':
        return inactiveReport?.data?.employees || [];
      case 'last7Days':
        return last7DaysReport?.data?.employees || [];
      default:
        return [];
    }
  };

  const isLoading = loadingAttendance || loadingLastPunch || loadingNoPunch || loadingInactive || loadingLast7Days;
  const reportData = getCurrentData();

  const reportTypes = [
    { key: 'attendance', label: 'Employee Attendance', icon: BarChart3 },
    { key: 'lastPunch', label: 'Last Punch Report', icon: Clock },
    { key: 'noPunch', label: 'No Punch Report', icon: Users },
    { key: 'inactive', label: 'Inactive Members', icon: Users },
    { key: 'last7Days', label: 'Inactive Last 7 Days', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate detailed reports and analyze gym data</p>
      </div>

      {/* Report Type Selection */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setReportType(type.key)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  reportType === type.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium text-center">{type.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Parameters */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {reportType === 'attendance' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label>
                <input
                  type="text"
                  value={dateMonthYear}
                  onChange={(e) => setDateMonthYear(e.target.value)}
                  placeholder="MM/yyyy"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </>
          )}

          {(reportType === 'lastPunch' || reportType === 'noPunch') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <DatePicker
                  selected={fromDate}
                  onChange={setFromDate}
                  dateFormat="yyyy-MM-dd"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <DatePicker
                  selected={toDate}
                  onChange={setToDate}
                  dateFormat="yyyy-MM-dd"
                  className="input-field"
                />
              </div>
            </>
          )}

          {reportType === 'inactive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inactive Days</label>
              <input
                type="number"
                value={inactiveDays}
                onChange={(e) => setInactiveDays(parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {reportTypes.find(type => type.key === reportType)?.label} Results
          </h3>
          {attendanceReport?.data && (
            <div className="text-sm text-gray-600">
              Total: {attendanceReport.data.total} | Page: {attendanceReport.data.pageNumber + 1}
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {reportType === 'attendance' && (
                    <>
                      <th className="table-header">Employee ID</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">Working Days</th>
                      <th className="table-header">Present Days</th>
                      <th className="table-header">Attendance %</th>
                    </>
                  )}
                  {reportType === 'lastPunch' && (
                    <>
                      <th className="table-header">Employee ID</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">DOJ</th>
                      <th className="table-header">Last Punch</th>
                    </>
                  )}
                  {reportType === 'noPunch' && (
                    <>
                      <th className="table-header">Employee ID</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">DOJ</th>
                      <th className="table-header">Contact</th>
                    </>
                  )}
                  {(reportType === 'inactive' || reportType === 'last7Days') && (
                    <>
                      <th className="table-header">Employee ID</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">DOJ</th>
                      <th className="table-header">Last Punch</th>
                      <th className="table-header">Inactive Days</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {reportType === 'attendance' && (
                      <>
                        <td className="table-cell font-medium">{item.employeeId}</td>
                        <td className="table-cell">{item.employeeName}</td>
                        <td className="table-cell">{item.workingDays}</td>
                        <td className="table-cell">{item.presentDays}</td>
                        <td className="table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (item.presentDays / item.workingDays) * 100 >= 80
                              ? 'bg-green-100 text-green-800'
                              : (item.presentDays / item.workingDays) * 100 >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {((item.presentDays / item.workingDays) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </>
                    )}
                    {reportType === 'lastPunch' && (
                      <>
                        <td className="table-cell font-medium">{item.employeeId}</td>
                        <td className="table-cell">{item.employeeName}</td>
                        <td className="table-cell">
                          {item.doj ? new Date(item.doj).toLocaleDateString() : '-'}
                        </td>
                        <td className="table-cell">
                          {item.lastPunchDate ? new Date(item.lastPunchDate).toLocaleString() : 'No punch'}
                        </td>
                      </>
                    )}
                    {reportType === 'noPunch' && (
                      <>
                        <td className="table-cell font-medium">{item.id}</td>
                        <td className="table-cell">{item.name}</td>
                        <td className="table-cell">
                          {item.doj ? new Date(item.doj).toLocaleDateString() : '-'}
                        </td>
                        <td className="table-cell">{item.contactNo}</td>
                      </>
                    )}
                    {(reportType === 'inactive' || reportType === 'last7Days') && (
                      <>
                        <td className="table-cell font-medium">{item.employeeId}</td>
                        <td className="table-cell">{item.employeeName}</td>
                        <td className="table-cell">
                          {item.doj ? new Date(item.doj).toLocaleDateString() : '-'}
                        </td>
                        <td className="table-cell">
                          {item.lastPunchDate ? new Date(item.lastPunchDate).toLocaleString() : 'No punch'}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.inactiveDaysSinceLastPunch > 30
                              ? 'bg-red-100 text-red-800'
                              : item.inactiveDaysSinceLastPunch > 15
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.inactiveDaysSinceLastPunch || 0} days
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {reportData.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data found for the selected criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination for attendance report */}
        {reportType === 'attendance' && attendanceReport?.data && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {page * size + 1} to {Math.min((page + 1) * size, attendanceReport.data.total)} of {attendanceReport.data.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * size >= attendanceReport.data.total}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;