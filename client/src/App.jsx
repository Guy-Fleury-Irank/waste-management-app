import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import SitesPage from './pages/SitesPage';
import CollectesPage from './pages/CollectesPage';
import VehiculesPage from './pages/VehiculesPage';
import AbonnementsPage from './pages/AbonnementsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import DebugMongoPage from './pages/DebugMongoPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '12px', padding: '12px 16px' },
        }} />
        <Layout>
          <Routes>
            {/* Page publique - Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Route de diagnostic MongoDB - accessible sans auth */}
            <Route path="/debug-mongo" element={<DebugMongoPage />} />

            {/* Routes protégées */}
            {/* Admin Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* Staff Dashboard */}
            <Route path="/staff-dashboard" element={
              <ProtectedRoute roles={['staff']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            } />

            {/* Client Dashboard */}
            <Route path="/client-dashboard" element={
              <ProtectedRoute roles={['client']}>
                <ClientDashboardPage />
              </ProtectedRoute>
            } />

            {/* Admin Users Management */}
            <Route path="/users" element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            <Route path="/sites" element={
              <ProtectedRoute roles={['admin', 'staff', 'client']}>
                <SitesPage />
              </ProtectedRoute>
            } />

            <Route path="/collectes" element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <CollectesPage />
              </ProtectedRoute>
            } />

            <Route path="/vehicules" element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <VehiculesPage />
              </ProtectedRoute>
            } />

            <Route path="/abonnements" element={
              <ProtectedRoute roles={['admin', 'staff', 'client']}>
                <AbonnementsPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute roles={['admin', 'staff', 'client']}>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;