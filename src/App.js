import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import CreateMember from './pages/CreateMember';
import UpdateMember from './pages/UpdateMember';
import DeleteMember from './pages/DeleteMember';
import PunchRecords from './pages/PunchRecords';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Partners from './pages/Partners';
import Reports from './pages/Reports';
import Birthdays from './pages/Birthdays';
import Holidays from './pages/Holidays';
import WhatsApp from './pages/WhatsApp';
import Settings from './pages/Settings';
import authService from './services/authService';

function App() {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is valid on app load
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Try to fetch current user to validate token
          const response = await fetch('http://localhost:9090/rockgymapp/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`
            }
          });
          
          if (!response.ok) {
            // Token is invalid, clear it
            authService.logout();
          }
        } catch (error) {
          // Network error or invalid token
          authService.logout();
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        authService.isAuthenticated() ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="members" element={<Members />} />
        <Route path="members/create" element={<CreateMember />} />
        <Route path="members/update" element={<UpdateMember />} />
        <Route path="members/delete" element={<DeleteMember />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="members/:id/punch-records" element={<PunchRecords />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="partners" element={<Partners />} />
        <Route path="reports" element={<Reports />} />
        <Route path="birthdays" element={<Birthdays />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="whatsapp" element={<WhatsApp />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;