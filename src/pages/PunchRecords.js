import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { memberService } from '../services/memberService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PunchRecords = () => {
  const { id } = useParams();
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  const { data: member, isLoading: loadingMember } = useQuery(
    ['member', id],
    () => memberService.getMemberById(id)
  );

  const { data: punchSummary, isLoading: loadingPunches, error: punchError } = useQuery(
    ['memberPunchSummary', id],
    () => memberService.getEmployeeMonthlyPunchSummary(id)
  );

  const toggleMonth = (monthYear) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthYear)) {
      newExpanded.delete(monthYear);
    } else {
      newExpanded.add(monthYear);
    }
    setExpandedMonths(newExpanded);
  };

  if (loadingMember || loadingPunches) {
    return <LoadingSpinner className="py-12" />;
  }

  if (punchError) {
    return <ErrorMessage message="Failed to load punch records" />;
  }

  const memberData = member?.data;
  const punchData = punchSummary?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={`/members/${id}`} className="btn-secondary flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Member Details
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punch Records</h1>
          <p className="text-gray-600">
            Attendance history for {memberData?.name || 'Member'}
          </p>
        </div>
      </div>

      {punchData.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Punch Records</h3>
            <p className="text-gray-600">This member has no attendance records yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {punchData.map((monthSummary) => (
            <div key={monthSummary.monthYear} className="card">
              <div
                className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 rounded-lg"
                onClick={() => toggleMonth(monthSummary.monthYear)}
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {monthSummary.monthYear}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {monthSummary.totalDays} days attended • {monthSummary.punchRecords.length} total punches
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800">
                    {monthSummary.totalDays} days
                  </span>
                  {expandedMonths.has(monthSummary.monthYear) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedMonths.has(monthSummary.monthYear) && (
                <div className="border-t border-gray-200 p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Date</th>
                          <th className="table-header">Day</th>
                          <th className="table-header">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthSummary.punchRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{new Date(record.date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {record.dayOfWeek}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{record.time}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PunchRecords;