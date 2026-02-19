import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
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