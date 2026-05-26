import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';
import { useAuthContext } from '../context/AuthContext';

import LandingPage from '../pages/home/LandingPage';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AppointmentsPage from '../pages/appointments/AppointmentsPage';
import BookAppointmentPage from '../pages/appointments/BookAppointmentPage';
import ServicesPage from '../pages/services/ServicesPage';
import PublicationsPage from '../pages/publications/PublicationsPage';
import PublicationDetailPage from '../pages/publications/PublicationDetailPage';

// Admin
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminServicesPage from '../pages/admin/services/AdminServicesPage';
import AdminPostsPage from '../pages/admin/posts/AdminPostsPage';
import AdminPostEditorPage from '../pages/admin/posts/AdminPostEditorPage';
import AdminMediaPage from '../pages/admin/media/AdminMediaPage';
import AdminUsersPage from '../pages/admin/users/AdminUsersPage';
import AdminSpecialistPage from '../pages/admin/specialist/AdminSpecialistPage';
import SpecialistProfilePage from '../pages/specialist/SpecialistProfilePage';
import AdminAppointmentsPage from '../pages/admin/appointments/AdminAppointmentsPage';

// ── Guards ───────────────────────────────────────────────────────────────────

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN' && user?.role !== 'EDITOR') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRoute() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <HomePage /> : <LandingPage />;
}

// ── Router ───────────────────────────────────────────────────────────────────

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<HomeRoute />} />

        {/* Páginas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/especialista" element={<SpecialistProfilePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/publications/:id" element={<PublicationDetailPage />} />

        {/* Páginas privadas */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
        <Route path="/appointments/book" element={<PrivateRoute><BookAppointmentPage /></PrivateRoute>} />

        {/* Panel Admin / Editor — layout con Outlet */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="posts/new" element={<AdminPostEditorPage />} />
          <Route path="posts/edit/:id" element={<AdminPostEditorPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="specialist" element={<AdminSpecialistPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
