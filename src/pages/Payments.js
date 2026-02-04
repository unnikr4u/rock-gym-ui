import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { CreditCard, Plus, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Payments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    employeeDetail: { id: '' },
    dueDate: new Date().toISOString().split('T')[0],
    paidAmount: '',
    paymentMode: 'Cash',
    advanceInMonths: 0,
    isAdmissionFee: false
  });

  const { data: pendingPayments, isLoading: loadingPending, refetch: refetchPending } = useQuery(
    ['pendingPayments', selectedDate],
    () => paymentService.getPendingPayments(selectedDate.toISOString().split('T')[0])
  );

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track and manage member payments</p>
        </div>
        
        <button
          onClick={() => setShowPaymentForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </button>
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

      {/* Date Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="yyyy-MM-dd"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
          <div className="text-sm text-gray-600">
            As of {selectedDate.toLocaleDateString()}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingPayments?.data?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">
                      {payment.employeeDetail?.id}
                    </td>
                    <td className="table-cell">
                      {payment.employeeDetail?.name}
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
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pendingPayments?.data?.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending payments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Total Collected</h3>
          <p className="text-2xl font-bold text-green-600">₹0</p>
          <p className="text-sm text-gray-600">This month</p>
        </div>
        <div className="card text-center">
          <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Pending Amount</h3>
          <p className="text-2xl font-bold text-red-600">
            ₹{pendingPayments?.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0}
          </p>
          <p className="text-sm text-gray-600">Outstanding</p>
        </div>
        <div className="card text-center">
          <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
          <p className="text-2xl font-bold text-blue-600">{pendingPayments?.data?.length || 0}</p>
          <p className="text-sm text-gray-600">Pending payments</p>
        </div>
      </div>
    </div>
  );
};

export default Payments;