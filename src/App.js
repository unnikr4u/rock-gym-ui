import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import CreateMember from './pages/CreateMember';
import UpdateMember from './pages/UpdateMember';
import PunchRecords from './pages/PunchRecords';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Birthdays from './pages/Birthdays';
import Holidays from './pages/Holidays';
import WhatsApp from './pages/WhatsApp';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/create" element={<CreateMember />} />
        <Route path="/members/update" element={<UpdateMember />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/members/:id/punch-records" element={<PunchRecords />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/birthdays" element={<Birthdays />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
      </Routes>
    </Layout>
  );
}

export default App;