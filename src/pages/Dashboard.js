import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, Clock, CreditCard, Calendar } from 'lucide-react';
import { memberService } from '../services/memberService';
import { paymentService } from '../services/paymentService';
import { attendanceService } from '../services/attendanceService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { data: paidMembers, isLoading: loadingPaid } = useQuery(
    'paidMembers',
    () => memberService.getPaidMembers()
  );

  const { data: unpaidMembers, isLoading: loadingUnpaid } = useQuery(
    'unpaidMembers',
    () => memberService.getUnpaidMembers()
  );

  const { data: pendingPayments, isLoading: loadingPayments } = useQuery(
    'pendingPayments',
    () => paymentService.getPendingPayments()
  );

  const { data: unattendedMembers, isLoading: loadingUnattended } = useQuery(
    'unattendedMembers',
    () => attendanceService.getInactiveLast30Days()
  );

  const { data: totalNonAdminMembers, isLoading: loadingTotalMembers } = useQuery(
    'totalNonAdminMembers',
    () => memberService.getAllMembers(0, 1, 'id', 'asc', false)
  );

  const stats = [
    {
      name: 'Paid Members',
      value: paidMembers?.data?.total || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/payments?paymentTab=paid',
      loading: loadingPaid,
    },
    {
      name: 'Unpaid Members',
      value: unpaidMembers?.data?.total || 0,
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/payments?paymentTab=pending',
      loading: loadingUnpaid,
    },
    {
      name: 'Pending Payments',
      value: pendingPayments?.data?.length || 0,
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/payments',
      loading: loadingPayments,
    },
    {
      name: 'Unattended Members',
      value: `${unattendedMembers?.data?.count || 0}/${totalNonAdminMembers?.data?.totalElements || 0}`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/attendance?tab=inactive&filter=30days',
      loading: loadingUnattended || loadingTotalMembers,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Rock Gym Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/members"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Manage Members</span>
            </Link>
            <Link
              to="/attendance"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Track Attendance</span>
            </Link>
            <Link
              to="/payments"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Process Payments</span>
            </Link>
            <Link
              to="/birthdays"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">View Birthdays</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">System is running smoothly</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Connected to Spring Boot API</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Database connection active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;