import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { CreditCard, Plus, Upload, Settings, Eye, Edit, Trash2, Search } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'view');
  const [activePaymentTab, setActivePaymentTab] = useState(searchParams.get('paymentTab') || 'pending');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Pagination states
  const [pendingPage, setPendingPage] = useState(0);
  const [paidPage, setPaidPage] = useState(0);
  const [newJoineePage, setNewJoineePage] = useState(0);
  const pageSize = 10;
  
  // Payment file upload states
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploadingPayments, setUploadingPayments] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    employeeDetail: { id: '' },
    dueDate: new Date().toISOString().split('T')[0],
    paidAmount: '',
    paymentMode: 'Cash',
    advanceInMonths: 0,
    isAdmissionFee: false
  });

  const { data: pendingPayments, isLoading: loadingPending, refetch: refetchPending } = useQuery(
    ['pendingPayments', pendingPage],
    () => paymentService.getPendingPayments(null, pendingPage, pageSize),
    { enabled: activeTab === 'view' && activePaymentTab === 'pending', keepPreviousData: true }
  );

  const { data: paidPayments, isLoading: loadingPaid, refetch: refetchPaid } = useQuery(
    ['paidPayments', paidPage],
    () => paymentService.getPaidPayments(null, paidPage, pageSize),
    { enabled: activeTab === 'view' && activePaymentTab === 'paid', keepPreviousData: true }
  );

  const { data: newJoineePayments, isLoading: loadingNewJoinee } = useQuery(
    ['newJoineePayments', newJoineePage],
    () => paymentService.getNewJoineePayments(null, newJoineePage, pageSize),
    { enabled: activeTab === 'view' && activePaymentTab === 'newJoinee', keepPreviousData: true }
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (tab !== 'view') params.set('tab', tab);
    if (activePaymentTab !== 'pending') params.set('paymentTab', activePaymentTab);
    setSearchParams(params);
  };

  const handlePaymentTabChange = (paymentTab) => {
    setActivePaymentTab(paymentTab);
    const params = new URLSearchParams();
    if (activeTab !== 'view') params.set('tab', activeTab);
    if (paymentTab !== 'pending') params.set('paymentTab', paymentTab);
    setSearchParams(params);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.savePayment({
        ...paymentForm,
        paidAmount: parseFloat(paymentForm.paidAmount),
        advanceInMonths: parseInt(paymentForm.advanceInMonths),
        paidOn: new Date().toISOString()
      });
      toast.success('Payment recorded successfully!');
      setShowPaymentForm(false);
      setPaymentForm({
        employeeDetail: { id: '' },
        dueDate: new Date().toISOString().split('T')[0],
        paidAmount: '',
        paymentMode: 'Cash',
        advanceInMonths: 0,
        isAdmissionFee: false
      });
      refetchPending();
    } catch (error) {
      toast.error('Failed to record payment: ' + (error.response?.data || error.message));
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'employeeId') {
      setPaymentForm(prev => ({
        ...prev,
        employeeDetail: { id: value }
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePaymentFileUpload = async () => {
    if (!paymentFile) {
      toast.error('Please select a payment file to upload');
      return;
    }

    setUploadingPayments(true);
    try {
      await paymentService.uploadPayments(paymentFile);
      toast.success('Payment records uploaded successfully!');
      setPaymentFile(null);
      refetchPending();
      refetchPaid(); // Refresh both pending and paid payments
    } catch (error) {
      toast.error('Failed to upload payment file: ' + (error.response?.data || error.message));
    } finally {
      setUploadingPayments(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track and manage member payments</p>
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
            <Eye className="h-4 w-4 inline mr-2" />
            View Payments
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
            Manage Payments
          </button>
        </nav>
      </div>

      {/* View Payments Tab */}
      {activeTab === 'view' && (
        <>
          {/* Payment Sub-tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handlePaymentTabChange('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activePaymentTab === 'pending'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Payments
              </button>
              <button
                onClick={() => handlePaymentTabChange('paid')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activePaymentTab === 'paid'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paid Payments
              </button>
              <button
                onClick={() => handlePaymentTabChange('newJoinee')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activePaymentTab === 'newJoinee'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                New Joinee Payments
              </button>
            </nav>
          </div>

          {/* Pending Payments Tab */}
          {activePaymentTab === 'pending' && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
                  <div className="text-sm text-gray-600">
                    Current month pending
                  </div>
                </div>
                
                {loadingPending ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Employee Name</th>
                          <th className="table-header">Due Date</th>
                          <th className="table-header">Amount</th>
                          <th className="table-header">Type</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingPayments?.data?.data?.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">
                              {payment.employeeDetailDto?.id}
                            </td>
                            <td className="table-cell">
                              {payment.employeeDetailDto?.name}
                            </td>
                            <td className="table-cell">
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="table-cell">₹{payment.amount}</td>
                            <td className="table-cell">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.isAdmissionFee 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.isAdmissionFee ? 'Admission' : 'Monthly'}
                              </span>
                            </td>
                            <td className="table-cell">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Pending
                              </span>
                            </td>
                            <td className="table-cell">
                              <button
                                onClick={() => navigate(`/members/${payment.employeeDetailDto?.id}?returnTo=/payments`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Member Details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {pendingPayments?.data?.data?.length === 0 && (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending payments found</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pagination */}
                {pendingPayments?.data?.page && pendingPayments.data.page.totalElements > 0 && (
                  <Pagination
                    currentPage={pendingPayments.data.page.number}
                    totalPages={pendingPayments.data.page.totalPages}
                    totalElements={pendingPayments.data.page.totalElements}
                    pageSize={pendingPayments.data.page.size}
                    onPageChange={setPendingPage}
                  />
                )}
              </div>

              {/* Pending Payment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Pending Amount</h3>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{pendingPayments?.data?.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0}
                  </p>
                  <p className="text-sm text-gray-600">Outstanding</p>
                </div>
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Pending Records</h3>
                  <p className="text-2xl font-bold text-orange-600">{pendingPayments?.data?.page?.totalElements || 0}</p>
                  <p className="text-sm text-gray-600">Unpaid payments</p>
                </div>
              </div>
            </>
          )}

          {/* Paid Payments Tab */}
          {activePaymentTab === 'paid' && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Paid Payments</h3>
                  <div className="text-sm text-gray-600">
                    Current month paid
                  </div>
                </div>
                
                {loadingPaid ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Employee Name</th>
                          <th className="table-header">Due Date</th>
                          <th className="table-header">Paid Date</th>
                          <th className="table-header">Paid Amount</th>
                          <th className="table-header">Payment Mode</th>
                          <th className="table-header">Type</th>
                          <th className="table-header">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paidPayments?.data?.data?.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">
                              {payment.employeeDetailDto?.id}
                            </td>
                            <td className="table-cell">
                              {payment.employeeDetailDto?.name}
                            </td>
                            <td className="table-cell">
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </td>
                            <td className="table-cell">
                              {payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">₹{payment.paidAmount || 0}</td>
                            <td className="table-cell">{payment.paymentMode || '-'}</td>
                            <td className="table-cell">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.isAdmissionFee 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.isAdmissionFee ? 'Admission' : 'Monthly'}
                              </span>
                            </td>
                            <td className="table-cell">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {paidPayments?.data?.data?.length === 0 && (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No paid payments found for current month</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pagination */}
                {paidPayments?.data?.page && paidPayments.data.page.totalElements > 0 && (
                  <Pagination
                    currentPage={paidPayments.data.page.number}
                    totalPages={paidPayments.data.page.totalPages}
                    totalElements={paidPayments.data.page.totalElements}
                    pageSize={paidPayments.data.page.size}
                    onPageChange={setPaidPage}
                  />
                )}
              </div>

              {/* Paid Payment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total Collected</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{paidPayments?.data?.data?.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Paid Records</h3>
                  <p className="text-2xl font-bold text-blue-600">{paidPayments?.data?.page?.totalElements || 0}</p>
                  <p className="text-sm text-gray-600">Completed payments</p>
                </div>
              </div>
            </>
          )}

          {/* New Joinee Payments Tab */}
          {activePaymentTab === 'newJoinee' && (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">New Joinee Payments</h3>
                  <div className="text-sm text-gray-600">
                    Admission fees for current month joiners
                  </div>
                </div>
                
                {loadingNewJoinee ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Employee ID</th>
                          <th className="table-header">Employee Name</th>
                          <th className="table-header">Date of Joining</th>
                          <th className="table-header">Admission Fee</th>
                          <th className="table-header">Paid Date</th>
                          <th className="table-header">Payment Mode</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {newJoineePayments?.data?.data?.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium">
                              {payment.employeeDetailDto?.id}
                            </td>
                            <td className="table-cell">
                              {payment.employeeDetailDto?.name}
                            </td>
                            <td className="table-cell">
                              {payment.employeeDetailDto?.doj ? new Date(payment.employeeDetailDto.doj).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">₹{payment.amount}</td>
                            <td className="table-cell">
                              {payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : '-'}
                            </td>
                            <td className="table-cell">{payment.paymentMode || '-'}</td>
                            <td className="table-cell">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.paid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.paid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="table-cell">
                              <button
                                onClick={() => navigate(`/members/${payment.employeeDetailDto?.id}?returnTo=/payments`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Member Details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {newJoineePayments?.data?.data?.length === 0 && (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No new joinee payments found for current month</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pagination */}
                {newJoineePayments?.data?.page && newJoineePayments.data.page.totalElements > 0 && (
                  <Pagination
                    currentPage={newJoineePayments.data.page.number}
                    totalPages={newJoineePayments.data.page.totalPages}
                    totalElements={newJoineePayments.data.page.totalElements}
                    pageSize={newJoineePayments.data.page.size}
                    onPageChange={setNewJoineePage}
                  />
                )}
              </div>

              {/* New Joinee Payment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total New Joiners</h3>
                  <p className="text-2xl font-bold text-blue-600">{newJoineePayments?.data?.page?.totalElements || 0}</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="card text-center">
                  <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total Admission Fees</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{newJoineePayments?.data?.data?.reduce((sum, payment) => sum + (payment.paid ? (payment.paidAmount || payment.amount) : 0), 0) || 0}
                  </p>
                  <p className="text-sm text-gray-600">Collected</p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Manage Payments Tab */}
      {activeTab === 'manage' && (
        <>
          {/* Payment Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-500" />
                Record New Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Manually record a payment for a member.
              </p>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="btn-primary w-full flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-orange-500" />
                Update Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Search and update existing payment records.
              </p>
              <button
                className="btn-secondary w-full flex items-center justify-center"
                onClick={() => toast.info('Update payment functionality coming soon!')}
              >
                <Search className="h-4 w-4 mr-2" />
                Search & Update
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-red-500" />
                Delete Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Search and delete payment records from the system.
              </p>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full flex items-center justify-center"
                onClick={() => toast.info('Delete payment functionality coming soon!')}
              >
                <Search className="h-4 w-4 mr-2" />
                Search & Delete
              </button>
            </div>
          </div>

          {/* Payment Form Modal */}
          {showPaymentForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Payment</h3>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="number"
                      required
                      value={paymentForm.employeeDetail.id}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      value={paymentForm.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.paidAmount}
                      onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                    <select
                      value={paymentForm.paymentMode}
                      onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                      className="input-field"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Advance Months</label>
                    <input
                      type="number"
                      min="0"
                      value={paymentForm.advanceInMonths}
                      onChange={(e) => handleInputChange('advanceInMonths', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAdmissionFee"
                      checked={paymentForm.isAdmissionFee}
                      onChange={(e) => handleInputChange('isAdmissionFee', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="isAdmissionFee" className="text-sm text-gray-700">
                      Admission Fee
                    </label>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Record Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Payment Upload Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-500" />
              Upload Monthly Payments
            </h3>
            <p className="text-gray-600 mb-6">
              Upload an Excel file with monthly payment records for existing members.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setPaymentFile(e.target.files[0])}
                  className="hidden"
                  id="payment-upload"
                />
                <label
                  htmlFor="payment-upload"
                  className="btn-secondary cursor-pointer flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Payment File
                </label>
                {paymentFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{paymentFile.name}</span>
                    <button
                      onClick={handlePaymentFileUpload}
                      disabled={uploadingPayments}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploadingPayments ? 'Uploading...' : 'Upload Payments'}
                    </button>
                  </div>
                )}
              </div>
              
              {paymentFile && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Payment File Selected:</h4>
                  <p className="text-sm text-blue-700">{paymentFile.name}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Click "Upload Payments" to process the file and create payment records.
                  </p>
                  <div className="mt-3 text-xs text-blue-600">
                    <p className="font-medium">Expected Excel columns:</p>
                    <p>EmployeeCode, EmployeeName, PaidAmount, PaidOn, AdvanceInMonths, PaymentMode, Expected Amount</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Management Instructions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Manual Payment Recording:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Use "Record New Payment" to manually enter individual payments</li>
                  <li>Specify employee ID, payment amount, and payment mode</li>
                  <li>Set advance months if member is paying for multiple months</li>
                  <li>Check "Admission Fee" for first-time member payments</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Excel File Format:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>EmployeeCode:</strong> Member ID (required)</li>
                  <li><strong>EmployeeName:</strong> Member name (for reference)</li>
                  <li><strong>PaidAmount:</strong> Amount paid by member</li>
                  <li><strong>PaidOn:</strong> Payment date (DD/MM/YYYY format)</li>
                  <li><strong>AdvanceInMonths:</strong> Number of advance months paid (optional)</li>
                  <li><strong>PaymentMode:</strong> Cash, UPI, Card, Bank Transfer, etc.</li>
                  <li><strong>Expected Amount:</strong> Expected payment amount (for reference)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Upload Behavior:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>If both PaidAmount and PaidOn are empty, the row will be skipped</li>
                  <li>If a payment record exists for the same member and month/year, it will be updated</li>
                  <li>If no record exists, a new payment record will be created</li>
                  <li>For paid payments, the next month's pending record will be created automatically</li>
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

export default Payments;