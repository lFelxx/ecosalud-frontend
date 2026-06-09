/// <reference types="vitest/globals" />

import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import { useRegister } from '../../../presentation/hooks/useRegister';

// ── Mock del caso de uso y repositorio ────────────────────────────────────
// vi.mock() se hoistea al inicio del archivo, antes de que 'const mockExecute'
// esté inicializado. Usamos vi.hoisted() para que la variable esté lista
// cuando se ejecuta la factory del mock.

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('../../../application/usecases/auth/RegisterUseCase', () => ({
  RegisterUseCase: vi.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

vi.mock('../../../infrastructure/repositories/AuthRepository', () => ({
  AuthRepository: vi.fn().mockImplementation(() => ({})),
}));

// ── Datos de prueba ────────────────────────────────────────────────────────

const mockAuthResponse = {
  token: 'register-token-123',
  user: {
    id: 10,
    name: 'Ana López',
    email: 'ana@ecosalud.com',
    role: 'PATIENT' as const,
    status: 'ACTIVE' as const,
  },
};

// ── Componente consumidor de prueba ────────────────────────────────────────

function RegisterHookConsumer() {
  const { handleRegister, loading, error } = useRegister();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <span data-testid="error">{error ?? 'no-error'}</span>
      <button
        data-testid="btn-register"
        onClick={() =>
          handleRegister({
            name: 'Ana',
            lastName: 'López',
            email: 'ana@ecosalud.com',
            therapy: 'Acupuntura',
            healthGoal: 'Reducir estrés',
          })
        }
      >
        Registrar
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

describe('useRegister — integración', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('estado inicial: no cargando, sin error', () => {
    render(<RegisterHookConsumer />, { wrapper: Wrapper });

    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('registro exitoso: guarda token en localStorage', async () => {
    mockExecute.mockResolvedValueOnce(mockAuthResponse);

    render(<RegisterHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(localStorage.getItem('token')).toBe('register-token-123');
  });

  it('registro exitoso: combina nombre y apellido antes de llamar al useCase', async () => {
    mockExecute.mockResolvedValueOnce(mockAuthResponse);

    render(<RegisterHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    // El hook combina name + lastName: "Ana López"
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ana López', email: 'ana@ecosalud.com' })
    );
  });

  it('registro fallido: muestra el error del servidor', async () => {
    mockExecute.mockRejectedValueOnce(new Error('El email ya está registrado'));

    render(<RegisterHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('El email ya está registrado');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('registro fallido: mensaje genérico si el error no es una instancia de Error', async () => {
    mockExecute.mockRejectedValueOnce('network-error');

    render(<RegisterHookConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Error al crear la cuenta.');
  });
});
