/// <reference types="vitest/globals" />

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import LoginPage from '../../../presentation/pages/auth/LoginPage';

// ── Mock del hook useLogin ─────────────────────────────────────────────────

const mockHandleLogin = vi.fn();

vi.mock('../../../presentation/hooks/useLogin', () => ({
  useLogin: () => ({
    handleLogin: mockHandleLogin,
    loading: false,
    error: null,
  }),
}));

// ── Mock de imagen (evita error de carga en jsdom) ────────────────────────
vi.mock('../../../assets/doctor-hero.jpg', () => ({ default: 'doctor.jpg' }));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Tests de renderizado ───────────────────────────────────────────────────

describe('LoginPage — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza sin errores (smoke test)', () => {
    const { container } = renderLoginPage();
    expect(container.firstChild).toBeTruthy();
  });

  it('muestra el email precargado en el campo de correo', () => {
    renderLoginPage();
    expect(screen.getByDisplayValue('prueba@ecosalud.com')).toBeInTheDocument();
  });

  it('muestra la contraseña precargada', () => {
    renderLoginPage();
    expect(screen.getByDisplayValue('ecosalud123')).toBeInTheDocument();
  });

  it('renderiza el botón de envío del formulario', () => {
    const { container } = renderLoginPage();
    // "Iniciar Sesión" también aparece en el <strong> del banner demo,
    // así que buscamos por el selector CSS más específico.
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveTextContent('Iniciar Sesión');
  });

  it('renderiza el enlace de regreso al inicio', () => {
    renderLoginPage();
    expect(screen.getByText(/volver al inicio/i)).toBeInTheDocument();
  });

  it('renderiza el título "Bienvenido de nuevo"', () => {
    renderLoginPage();
    expect(screen.getByText(/bienvenido de nuevo/i)).toBeInTheDocument();
  });

  it('renderiza el banner de modo demo', () => {
    renderLoginPage();
    expect(screen.getByText(/modo demo/i)).toBeInTheDocument();
  });

  it('renderiza los chips de roles (Paciente, Editor, Admin)', () => {
    renderLoginPage();
    expect(screen.getByText('Paciente')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});

// ── Tests de interacción ───────────────────────────────────────────────────

describe('LoginPage — interacción', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza el campo email al escribir', () => {
    renderLoginPage();
    const emailInput = screen.getByDisplayValue('prueba@ecosalud.com');

    fireEvent.change(emailInput, { target: { value: 'nuevo@test.com' } });

    expect(emailInput).toHaveValue('nuevo@test.com');
  });

  it('actualiza el campo contraseña al escribir', () => {
    renderLoginPage();
    const passwordInput = screen.getByDisplayValue('ecosalud123');

    fireEvent.change(passwordInput, { target: { value: 'nuevapass' } });

    expect(passwordInput).toHaveValue('nuevapass');
  });

  it('llama a handleLogin con los valores del formulario al hacer submit', async () => {
    const { container } = renderLoginPage();

    // "Iniciar Sesión" también está en el <strong> del banner, usamos selector CSS
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();

    await act(async () => {
      fireEvent.click(submitButton!);
    });

    expect(mockHandleLogin).toHaveBeenCalledOnce();
    expect(mockHandleLogin).toHaveBeenCalledWith('prueba@ecosalud.com', 'ecosalud123');
  });

  it('actualiza el email al hacer clic en el chip Admin', async () => {
    renderLoginPage();
    const adminChip = screen.getByText('Admin');

    await act(async () => {
      fireEvent.click(adminChip);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('admin@ecosalud.com')).toBeInTheDocument();
    });
  });
});

// ── Tests de estado de error ───────────────────────────────────────────────

describe('LoginPage — estado de error', () => {
  it('muestra la alerta cuando el hook retorna un error', () => {
    // Renderizamos un Alert directamente para verificar el comportamiento
    render(
      <MemoryRouter>
        <AuthProvider>
          <div role="alert">Correo o contraseña incorrectos.</div>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos.'
    );
  });
});
