import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, Download, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';

const Reports = () => {
  const [searchParams] = useSearchParams();
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'monthlyRevenue');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [defaultersPage, setDefaultersPage] = useState(0);
  const defaultersPageSize = 10;
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Update report type from URL when component mounts or URL changes
  useEffect(() => {
    const urlReportType = searchParams.get('reportType');
    if (urlReportType) {
      setReportType(urlReportType);
    }
  }, [searchParams]);

  const { data: monthlyRevenue, isLoading: loadingRevenue, refetch: refetchRevenue } = useQuery(
    'monthlyRevenue',
    () => reportService.getMonthlyRevenue(12),
    { enabled: reportType === 'monthlyRevenue' }
  );

  const { data: collectionSummary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery(
    ['collectionSummary', selectedYear, selectedMonth],
    () => reportService.getPaymentCollectionSummary(selectedYear, selectedMonth),
    { enabled: reportType === 'collectionSummary' }
  );

  const { data: defaulters, isLoading: loadingDefaulters, refetch: refetchDefaulters } = useQuery(
    ['defaulters', defaultersPage],
    () => reportService.getDefaulters(defaultersPage, defaultersPageSize),
    { enabled: reportType === 'defaulters', keepPreviousData: true }
  );

  const { data: paymentModeAnalysis, isLoading: loadingPaymentMode, refetch: refetchPaymentMode } = useQuery(
    'paymentModeAnalysis',
    () => reportService.getPaymentModeAnalysis(12),
    { enabled: reportType === 'paymentModeAnalysis' }
  );

  const { data: memberPaymentHistory, isLoading: loadingMemberHistory, refetch: refetchMemberHistory } = useQuery(
    ['memberPaymentHistory', selectedMemberId],
    () => reportService.getMemberPaymentHistory(selectedMemberId),
    { enabled: reportType === 'memberPaymentHistory' && selectedMemberId !== '' }
  );

  const { data: partnerSettlement, isLoading: loadingPartnerSettlement, refetch: refetchPartnerSettlement } = useQuery(
    ['partnerSettlement', selectedYear, selectedMonth],
    () => reportService.getPartnerSettlement(selectedYear, selectedMonth),
    { enabled: reportType === 'partnerSettlement' }
  );

  const handleGenerateReport = () => {
    switch (reportType) {
      case 'monthlyRevenue':
        refetchRevenue();
        break;
      case 'collectionSummary':
        refetchSummary();
        break;
      case 'defaulters':
        refetchDefaulters();
        break;
      case 'paymentModeAnalysis':
        refetchPaymentMode();
        break;
      case 'memberPaymentHistory':
        if (selectedMemberId) {
          refetchMemberHistory();
        } else {
          toast.error('Please enter a Member ID');
          return;
        }
        break;
      case 'partnerSettlement':
        refetchPartnerSettlement();
        break;
      default:
        break;
    }
    toast.success('Report generated successfully!');
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  const reportTypes = [
    { key: 'monthlyRevenue', label: 'Monthly Revenue Report', icon: TrendingUp },
    { key: 'collectionSummary', label: 'Payment Collection Summary', icon: DollarSign },
    { key: 'defaulters', label: 'Defaulter Report', icon: AlertCircle },
    { key: 'paymentModeAnalysis', label: 'Payment Mode Analysis', icon: BarChart3 },
    { key: 'memberPaymentHistory', label: 'Member Payment History', icon: TrendingUp },
    { key: 'partnerSettlement', label: 'Partner Settlement Report', icon: DollarSign },
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const isLoading = loadingRevenue || loadingSummary || loadingDefaulters || loadingPaymentMode || loadingMemberHistory || loadingPartnerSettlement;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Reports & Analytics</h1>
        <p className="text-gray-600">Generate detailed payment reports and analyze revenue data</p>
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

      {/* Action Buttons */}
      <div className="card">
        <div className="flex space-x-4">
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Monthly Revenue Report */}
          {reportType === 'monthlyRevenue' && monthlyRevenue?.data && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyRevenue.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" name="Total Revenue (₹)" />
                    <Bar dataKey="admissionFees" fill="#10b981" name="Admission Fees (₹)" />
                    <Bar dataKey="monthlyFees" fill="#f59e0b" name="Monthly Fees (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header">Month</th>
                        <th className="table-header">Total Revenue</th>
                        <th className="table-header">Members Paid</th>
                        <th className="table-header">Admission Fees</th>
                        <th className="table-header">Admission Count</th>
                        <th className="table-header">Monthly Fees</th>
                        <th className="table-header">Monthly Count</th>
                        <th className="table-header">Avg per Member</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {monthlyRevenue.data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="table-cell font-medium">{item.month}</td>
                          <td className="table-cell">₹{item.totalRevenue?.toFixed(2)}</td>
                          <td className="table-cell">{item.memberCount}</td>
                          <td className="table-cell">₹{item.admissionFees?.toFixed(2)}</td>
                          <td className="table-cell">{item.admissionFeeCount}</td>
                          <td className="table-cell">₹{item.monthlyFees?.toFixed(2)}</td>
                          <td className="table-cell">{item.monthlyFeeCount}</td>
                          <td className="table-cell">₹{item.averagePerMember?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment Collection Summary */}
          {reportType === 'collectionSummary' && (
            <div className="space-y-6">
              {/* Month/Year Selector */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Month & Year</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="input-field"
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {[2024, 2025, 2026, 2027].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {collectionSummary?.data && (
                <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Paid Members</h3>
                  <p className="text-2xl font-bold text-green-600">{collectionSummary.data.paidCount}</p>
                  <p className="text-sm text-gray-600">₹{collectionSummary.data.paidAmount?.toFixed(2)}</p>
                </div>
                <div className="card text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Pending Members</h3>
                  <p className="text-2xl font-bold text-red-600">{collectionSummary.data.pendingCount}</p>
                  <p className="text-sm text-gray-600">₹{collectionSummary.data.pendingAmount?.toFixed(2)}</p>
                </div>
                <div className="card text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total Members</h3>
                  <p className="text-2xl font-bold text-blue-600">{collectionSummary.data.totalMembers}</p>
                  <p className="text-sm text-gray-600">Selected Month</p>
                </div>
                <div className="card text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Collection Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">{collectionSummary.data.collectionRate?.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: collectionSummary.data.paidCount },
                        { name: 'Pending', value: collectionSummary.data.pendingCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              </>
              )}
            </div>
          )}

          {/* Defaulter Report */}
          {reportType === 'defaulters' && defaulters?.data && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Defaulters List</h3>
                <div className="text-sm text-gray-600">
                  Total Defaulters: {defaulters.data.page?.totalElements || 0}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Member ID</th>
                      <th className="table-header">Name</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header">Days Overdue</th>
                      <th className="table-header">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {defaulters.data.data?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{item.memberId}</td>
                        <td className="table-cell">{item.memberName}</td>
                        <td className="table-cell">{item.contactNo || '-'}</td>
                        <td className="table-cell">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.daysOverdue > 30
                              ? 'bg-red-100 text-red-800'
                              : item.daysOverdue > 15
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.daysOverdue} days
                          </span>
                        </td>
                        <td className="table-cell">₹{item.amountDue?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {defaulters.data.data?.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No defaulters found! All payments are up to date.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {defaulters.data.page && defaulters.data.page.totalElements > 0 && (
                <Pagination
                  currentPage={defaulters.data.page.number}
                  totalPages={defaulters.data.page.totalPages}
                  totalElements={defaulters.data.page.totalElements}
                  pageSize={defaulters.data.page.size}
                  onPageChange={setDefaultersPage}
                />
              )}
            </div>
          )}

          {/* Payment Mode Analysis Report */}
          {reportType === 'paymentModeAnalysis' && paymentModeAnalysis?.data && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Mode Distribution (Last 12 Months)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={paymentModeAnalysis.data.map(item => ({
                        name: item.paymentMode,
                        value: item.totalAmount
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentModeAnalysis.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paymentModeAnalysis.data.map((item, index) => (
                  <div key={index} className="card text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2" style={{ color: COLORS[index % COLORS.length] }} />
                    <h3 className="text-lg font-medium text-gray-900">{item.paymentMode}</h3>
                    <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                      ₹{item.totalAmount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{item.count} transactions</p>
                    <p className="text-xs text-gray-500">{item.percentage?.toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Payment History Report */}
          {reportType === 'memberPaymentHistory' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Search Member</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Enter Member ID"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => refetchMemberHistory()}
                    disabled={!selectedMemberId}
                    className="btn-primary"
                  >
                    Search
                  </button>
                </div>
              </div>

              {memberPaymentHistory?.data && (
                <>
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Payment History for{' '}
                      <Link 
                        to={`/members/${selectedMemberId}?returnTo=/reports?reportType=${reportType}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {memberPaymentHistory.data[0]?.memberName || `Member #${selectedMemberId}`}
                      </Link>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="table-header">Due Date</th>
                            <th className="table-header">Paid Date</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Expected Amount</th>
                            <th className="table-header">Paid Amount</th>
                            <th className="table-header">Payment Mode</th>
                            <th className="table-header">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {memberPaymentHistory.data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="table-cell">
                                {new Date(item.dueDate).toLocaleDateString()}
                              </td>
                              <td className="table-cell">
                                {item.paidOn ? new Date(item.paidOn).toLocaleDateString() : '-'}
                              </td>
                              <td className="table-cell">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.isAdmissionFee 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.isAdmissionFee ? 'Admission' : 'Monthly'}
                                </span>
                              </td>
                              <td className="table-cell">₹{item.amount?.toFixed(2)}</td>
                              <td className="table-cell">₹{item.paidAmount?.toFixed(2)}</td>
                              <td className="table-cell">{item.paymentMode || '-'}</td>
                              <td className="table-cell">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.isPaid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {memberPaymentHistory.data.length === 0 && (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No payment history found for this member</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Partner Settlement Report */}
          {reportType === 'partnerSettlement' && (
            <div className="space-y-6">
              {/* Month/Year Selector */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Month & Year</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="input-field"
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {[2024, 2025, 2026, 2027].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {partnerSettlement?.data && (
                <>
              {/* Overall Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center bg-blue-50">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{partnerSettlement.data.totalIncome?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    UPI: ₹{partnerSettlement.data.totalUpiIncome?.toFixed(2)} | Cash: ₹{partnerSettlement.data.totalCashIncome?.toFixed(2)}
                  </p>
                </div>

                <div className="card text-center bg-red-50">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{partnerSettlement.data.totalExpenses?.toFixed(2)}
                  </p>
                </div>

                <div className="card text-center bg-green-50">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{partnerSettlement.data.netProfit?.toFixed(2)}
                  </p>
                </div>

                <div className="card text-center bg-purple-50">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-600">Per Partner Share</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{partnerSettlement.data.partner797ProfitShare?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Partner Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partnerSettlement.data.partnerBalances?.map((partner, index) => {
                  const colorClasses = [
                    {
                      card: 'bg-gradient-to-br from-blue-50 to-blue-100',
                      title: 'text-blue-900',
                      border: 'border-blue-300'
                    },
                    {
                      card: 'bg-gradient-to-br from-purple-50 to-purple-100',
                      title: 'text-purple-900',
                      border: 'border-purple-300'
                    },
                    {
                      card: 'bg-gradient-to-br from-green-50 to-green-100',
                      title: 'text-green-900',
                      border: 'border-green-300'
                    },
                    {
                      card: 'bg-gradient-to-br from-orange-50 to-orange-100',
                      title: 'text-orange-900',
                      border: 'border-orange-300'
                    }
                  ];
                  const colorClass = colorClasses[index % colorClasses.length];
                  
                  return (
                    <div key={partner.partnerId} className={`card ${colorClass.card}`}>
                      <h3 className={`text-xl font-bold ${colorClass.title} mb-4`}>
                        {partner.partnerName} (Employee ID: {partner.employeeId})
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Cash Collected:</span>
                          <span className="font-semibold text-green-600">
                            +₹{partner.cashCollected?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Expenses Paid:</span>
                          <span className="font-semibold text-red-600">
                            -₹{partner.expensesPaid?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Profit Share ({partner.profitSharePercentage}%):</span>
                          <span className="font-semibold text-green-600">
                            +₹{partner.profitShare?.toFixed(2)}
                          </span>
                        </div>
                        <div className={`border-t-2 ${colorClass.border} pt-3 mt-3`}>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Final Balance:</span>
                            <span className={`text-2xl font-bold ${
                              partner.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{partner.balance?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Settlement Message */}
              <div className={`card text-center ${
                partnerSettlement.data.settlementDirection === 'BALANCED' 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : 'bg-yellow-50 border-2 border-yellow-300'
              }`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Settlement</h3>
                <p className="text-xl font-semibold text-gray-800">
                  {partnerSettlement.data.settlementMessage}
                </p>
                {partnerSettlement.data.settlementDirection !== 'BALANCED' && (
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    ₹{partnerSettlement.data.settlementAmount?.toFixed(2)}
                  </p>
                )}
              </div>
              </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
