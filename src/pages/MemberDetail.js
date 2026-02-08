import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, User, Phone, Calendar, Scale, Droplets } from 'lucide-react';
import { memberService } from '../services/memberService';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MemberDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/members';

  const { data: member, isLoading: loadingMember, error: memberError } = useQuery(
    ['member', id],
    () => memberService.getMemberById(id)
  );

  const { data: payments, isLoading: loadingPayments } = useQuery(
    ['memberPayments', id],
    () => paymentService.getMemberPayments(id)
  );

  if (loadingMember) {
    return <LoadingSpinner className="py-12" />;
  }

  if (memberError) {
    return <ErrorMessage message="Failed to load member details" />;
  }

  const memberData = member?.data;
  const paymentData = payments?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={returnTo} className="btn-secondary flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
          <p className="text-gray-600">View member information and payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{memberData?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{memberData?.contactNo || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {memberData?.dob ? new Date(memberData.dob).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date of Joining</p>
                  <p className="font-medium">
                    {memberData?.doj ? new Date(memberData.doj).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Scale className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">{memberData?.weight ? `${memberData.weight} kg` : '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium">{memberData?.bloodGroup || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Payment History</h3>
            
            <div className="space-y-6">
              {/* Admission Fee Section */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Admission Fee</h4>
                {loadingPayments ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Due Date</th>
                          <th className="table-header">Expected Amount</th>
                          <th className="table-header">Admission Fee</th>
                          <th className="table-header">Advanced Amount</th>
                          <th className="table-header">Paid Amount</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Payment Mode</th>
                          <th className="table-header">Paid On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentData.filter(payment => payment.admissionFee).map((payment) => (
                          <tr key={payment.id}>
                            <td className="table-cell">
                              {new Date(payment.dueDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="table-cell">₹{payment.amount}</td>
                            <td className="table-cell">₹{payment.admissionAmount || 0}</td>
                            <td className="table-cell">₹{payment.advancedAmount || 0}</td>
                            <td className="table-cell">₹{payment.paidAmount || 0}</td>
                            <td className="table-cell">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  payment.paid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {payment.paid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="table-cell">{payment.paymentMode || '-'}</td>
                            <td className="table-cell">
                              {payment.paidOn ? new Date(payment.paidOn).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {paymentData.filter(payment => payment.admissionFee).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No admission fee records found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Monthly Fees Section */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Monthly Fees</h4>
                {loadingPayments ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Due Date</th>
                          <th className="table-header">Expected Amount</th>
                          <th className="table-header">Admission Fee</th>
                          <th className="table-header">Advanced Amount</th>
                          <th className="table-header">Paid Amount</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Payment Mode</th>
                          <th className="table-header">Paid On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paymentData.filter(payment => !payment.admissionFee).map((payment) => (
                          <tr key={payment.id}>
                            <td className="table-cell">
                              {new Date(payment.dueDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="table-cell">₹{payment.amount}</td>
                            <td className="table-cell">₹{payment.admissionAmount || 0}</td>
                            <td className="table-cell">₹{payment.advancedAmount || 0}</td>
                            <td className="table-cell">₹{payment.paidAmount || 0}</td>
                            <td className="table-cell">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  payment.paid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {payment.paid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="table-cell">{payment.paymentMode || '-'}</td>
                            <td className="table-cell">
                              {payment.paidOn ? new Date(payment.paidOn).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {paymentData.filter(payment => !payment.admissionFee).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No monthly fee records found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Membership Status */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Membership From</p>
                <p className="font-medium">
                  {memberData?.expiryFrom ? new Date(memberData.expiryFrom).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membership To</p>
                <p className="font-medium">
                  {memberData?.expiryTo ? new Date(memberData.expiryTo).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    memberData?.expiryTo && new Date(memberData.expiryTo) >= new Date()
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {memberData?.expiryTo && new Date(memberData.expiryTo) >= new Date() ? 'Active' : 'Expired'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Punch</p>
                <p className="font-medium">
                  {memberData?.lastPunchDate 
                    ? new Date(memberData.lastPunchDate).toLocaleString() 
                    : 'No punch records'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary">
                Record Payment
              </button>
              <button className="w-full btn-secondary">
                Send WhatsApp Message
              </button>
              <Link 
                to={`/members/${id}/punch-records`}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Punch Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;