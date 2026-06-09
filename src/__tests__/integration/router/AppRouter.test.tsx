/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../../../presentation/context/AuthContext';
import type { User } from '../../../domain/entities/User';
import type { ReactNode } from 'react';

// ── Mock del contexto de auth ───────────────────────────────────────────────
// Mockeamos useAuthContext para controlar el estado de forma síncrona.
// Esto evita el problema de useEffect + localStorage: cuando PrivateRoute
// se renderiza con isAuthenticated=false, navega a /login antes de que el
// efecto actualice el estado, y el router ya no vuelve a /dashboard.
vi.mock('../../../presentation/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// ── Guards del router (copiados de AppRouter para probar aisladamente) ─────

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
  return isAuthenticated ? <div>HomePage</div> : <div>LandingPage</div>;
}

// ── Usuarios de prueba ─────────────────────────────────────────────────────

const patientUser: User = {
  id: 1, name: 'Paciente', email: 'p@test.com', role: 'PATIENT', status: 'ACTIVE',
};
const adminUser: User = {
  id: 2, name: 'Admin', email: 'a@test.com', role: 'ADMIN', status: 'ACTIVE',
};
const editorUser: User = {
  id: 3, name: 'Editor', email: 'e@test.com', role: 'EDITOR', status: 'ACTIVE',
};

// ── Helper: configura el estado de autenticación mockeado ──────────────────

function mockAuth(isAuthenticated: boolean, user: User | null = null) {
  vi.mocked(useAuthContext).mockReturnValue({
    isAuthenticated,
    user,
    token: isAuthenticated ? 'mock-token' : null,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

// ── Helper: renderiza el router con una ruta inicial ───────────────────────

function renderRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<div>LoginPage</div>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div>DashboardPage</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>AdminPage</div>
            </AdminRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AppRouter — HomeRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra LandingPage a usuarios no autenticados', () => {
    mockAuth(false);
    renderRouter('/');
    expect(screen.getByText('LandingPage')).toBeInTheDocument();
  });

  it('muestra HomePage a usuarios autenticados', () => {
    mockAuth(true, patientUser);
    renderRouter('/');
    expect(screen.getByText('HomePage')).toBeInTheDocument();
  });
});

describe('AppRouter — PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige al login si el usuario no está autenticado', () => {
    mockAuth(false);
    renderRouter('/dashboard');
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('DashboardPage')).not.toBeInTheDocument();
  });

  it('permite acceso a ruta privada cuando el usuario está autenticado', () => {
    mockAuth(true, patientUser);
    renderRouter('/dashboard');
    expect(screen.getByText('DashboardPage')).toBeInTheDocument();
    expect(screen.queryByText('LoginPage')).not.toBeInTheDocument();
  });
});

describe('AppRouter — AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige al login si el usuario no está autenticado', () => {
    mockAuth(false);
    renderRouter('/admin');
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  it('redirige al inicio si el usuario es PATIENT (sin permiso)', () => {
    mockAuth(true, patientUser);
    renderRouter('/admin');
    // El AdminRoute redirige a "/" → HomeRoute muestra "HomePage" (auth=true)
    expect(screen.getByText('HomePage')).toBeInTheDocument();
    expect(screen.queryByText('AdminPage')).not.toBeInTheDocument();
  });

  it('permite acceso al panel admin cuando el usuario es ADMIN', () => {
    mockAuth(true, adminUser);
    renderRouter('/admin');
    expect(screen.getByText('AdminPage')).toBeInTheDocument();
  });

  it('permite acceso al panel admin cuando el usuario es EDITOR', () => {
    mockAuth(true, editorUser);
    renderRouter('/admin');
    expect(screen.getByText('AdminPage')).toBeInTheDocument();
  });
});
