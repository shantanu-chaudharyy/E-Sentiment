import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import RequireAuth from './components/RequireAuth';

import Landing from './pages/public/Landing';
import Consultations from './pages/public/Consultations';
import ConsultationDetail from './pages/public/ConsultationDetail';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ConsultationManagement from './pages/admin/ConsultationManagement';
import CommentsManagement from './pages/admin/CommentsManagement';
import AIAnalyzer from './pages/admin/AIAnalyzer';
import Insights from './pages/admin/Insights';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/consultations/:id" element={<ConsultationDetail />} />
        </Route>

        {/* Admin auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin (protected) */}
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/consultations" element={<ConsultationManagement />} />
          <Route path="/admin/comments" element={<CommentsManagement />} />
          <Route path="/admin/ai-analysis" element={<AIAnalyzer />} />
          <Route path="/admin/insights" element={<Insights />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
