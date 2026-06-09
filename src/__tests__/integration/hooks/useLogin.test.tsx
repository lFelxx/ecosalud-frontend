/// <reference types="vitest/globals" />

import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import { useLogin } from '../../../presentation/hooks/useLogin';

// ── Mock del caso de uso para simular llamada real al backend ──────────────
vi.mock('../../../application/usecases/auth/LoginUseCase', () => ({
  LoginUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockRejectedValue(new Error('Correo o contraseña incorrectos.')),
  })),
}));

vi.mock('../../../infrastructure/repositories/AuthRepository', () => ({
  AuthRepository: vi.fn().mockImplementation(() => ({})),
}));

// ── Componente de prueba que expone el hook ────────────────────────────────

function LoginHookConsumer() {
  const { handleLogin, loading, error } = useLogin();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <span data-testid="error">{error ?? 'no-error'}</span>
      <button
        data-testid="btn-admin"
        onClick={() => handleLogin('admin@ecosalud.com', 'admin123')}
      >
        Login Admin
      </button>
      <button
        data-testid="btn-patient"
        onClick={() => handleLogin('prueba@ecosalud.com', 'ecosalud123')}
      >
        Login Paciente
      </button>
      <button
        data-testid="btn-wrong"
        onClick={() => handleLogin('x@x.com', 'wrong')}
      >
        Login Incorrecto
      </button>
      <button
        data-testid="btn-empty"
        onClick={() => handleLogin('', '')}
      >
        Login Vacío
      </button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('useLogin — integración con mock DB', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('estado inicial: no cargando, sin error', () => {
    render(<LoginHookConsumer />, { wrapper: Wrapper });

    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('login admin: autentica correctamente con credenciales del mock', async () => {
    render(<LoginHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-admin'));
    });

    // Sin error después del login exitoso con mock
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');

    // Token guardado en localStorage
    expect(localStorage.getItem('token')).toBe('mock-token-admin');
  });

  it('login paciente: autentica correctamente con credenciales del mock', async () => {
    render(<LoginHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-patient'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(localStorage.getItem('token')).toBe('mock-token-patient');
  });

  it('login incorrecto: muestra error cuando las credenciales son inválidas', async () => {
    render(<LoginHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-wrong'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Correo o contraseña incorrectos.');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
  });

  it('no guarda token cuando las credenciales son inválidas', async () => {
    render(<LoginHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-wrong'));
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
