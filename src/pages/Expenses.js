import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { DollarSign, Plus, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';

const Expenses = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [expenseFile, setExpenseFile] = useState(null);
  const [uploadingExpenses, setUploadingExpenses] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidByEmployeeId: '',
    remarks: ''
  });

  const { data: expenses, isLoading, refetch } = useQuery(
    ['expenses', page, selectedYear, selectedMonth],
    () => expenseService.getAllExpenses(page, pageSize, selectedYear, selectedMonth),
    { keepPreviousData: true }
  );

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        paidByEmployeeId: expenseForm.paidByEmployeeId ? parseInt(expenseForm.paidByEmployeeId) : null
      };

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseData);
        toast.success('Expense updated successfully!');
      } else {
        await expenseService.createExpense(expenseData);
        toast.success('Expense created successfully!');
      }
      
      setShowExpenseForm(false);
      setEditingExpense(null);
      setExpenseForm({
        expenseName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidByEmployeeId: '',
        remarks: ''
      });
      refetch();
    } catch (error) {
      toast.error('Failed to save expense: ' + (error.response?.data || error.message));
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      expenseName: expense.expenseName,
      amount: expense.amount,
      date: expense.date,
      paidByEmployeeId: expense.paidByEmployeeId || '',
      remarks: expense.remarks || ''
    });
    setShowExpenseForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted successfully!');
        refetch();
      } catch (error) {
        toast.error('Failed to delete expense: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleExpenseFileUpload = async () => {
    if (!expenseFile) {
      toast.error('Please select an expense file to upload');
      return;
    }

    setUploadingExpenses(true);
    try {
      await expenseService.uploadExpenses(expenseFile);
      toast.success('Expense records uploaded successfully!');
      setExpenseFile(null);
      refetch();
    } catch (error) {
      toast.error('Failed to upload expense file: ' + (error.response?.data || error.message));
    } finally {
      setUploadingExpenses(false);
    }
  };

  const handleInputChange = (field, value) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage gym expenses</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            View Expenses
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Manage Expenses
          </button>
        </nav>
      </div>

      {/* View Expenses Tab */}
      {activeTab === 'view' && (
        <div className="space-y-4">
          {/* Filter Section */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Expenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(parseInt(e.target.value));
                    setPage(0); // Reset to first page when filter changes
                  }}
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
                  onChange={(e) => {
                    setSelectedYear(parseInt(e.target.value));
                    setPage(0); // Reset to first page when filter changes
                  }}
                  className="input-field"
                >
                  {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">All Expenses</h3>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Expense Name</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Paid By</th>
                    <th className="table-header">Remarks</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses?.data?.data?.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="table-cell font-medium">{expense.expenseName}</td>
                      <td className="table-cell">₹{expense.amount?.toFixed(2)}</td>
                      <td className="table-cell">
                        {expense.paidByEmployeeName || '-'}
                        {expense.paidByEmployeeId && ` (ID: ${expense.paidByEmployeeId})`}
                      </td>
                      <td className="table-cell">{expense.remarks || '-'}</td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
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

              {expenses?.data?.data?.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No expenses found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {expenses?.data?.page && expenses.data.page.totalElements > 0 && (
            <Pagination
              currentPage={expenses.data.page.number}
              totalPages={expenses.data.page.totalPages}
              totalElements={expenses.data.page.totalElements}
              pageSize={expenses.data.page.size}
              onPageChange={setPage}
            />
          )}
        </div>
        </div>
      )}

      {/* Manage Expenses Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {/* Add Expense Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Expense</h3>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm({
                    expenseName: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    paidByEmployeeId: '',
                    remarks: ''
                  });
                  setShowExpenseForm(true);
                }}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Click the button above to add a new expense manually
            </p>
          </div>

          {/* Upload Expenses Section */}
          <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Expenses from Excel</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExpenseFile(e.target.files[0])}
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-2">
                Excel should have columns: EXPENSES, AMOUNT, Date, PaidBy(employeeId)
              </p>
            </div>
            <button
              onClick={handleExpenseFileUpload}
              disabled={!expenseFile || uploadingExpenses}
              className="btn-primary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingExpenses ? 'Uploading...' : 'Upload Expenses'}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Name</label>
                <input
                  type="text"
                  required
                  value={expenseForm.expenseName}
                  onChange={(e) => handleInputChange('expenseName', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid By (Employee ID)
                </label>
                <input
                  type="number"
                  value={expenseForm.paidByEmployeeId}
                  onChange={(e) => handleInputChange('paidByEmployeeId', e.target.value)}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={expenseForm.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Optional"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingExpense ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
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

export default Expenses;
