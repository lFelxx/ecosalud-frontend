/// <reference types="vitest/globals" />

import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../../../presentation/context/AuthContext';
import type { User } from '../../../domain/entities/User';

// ── Componente consumidor de prueba ────────────────────────────────────────

const mockUser: User = {
  id: 1,
  name: 'Paciente Prueba',
  email: 'prueba@ecosalud.com',
  role: 'PATIENT',
  status: 'ACTIVE',
};

function TestConsumer() {
  const { user, token, isAuthenticated, login, logout } = useAuthContext();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-name">{user?.name ?? 'none'}</span>
      <span data-testid="user-role">{user?.role ?? 'none'}</span>
      <span data-testid="token">{token ?? 'no-token'}</span>
      <button
        onClick={() => login('test-token-abc', mockUser)}
        data-testid="btn-login"
      >
        Login
      </button>
      <button onClick={logout} data-testid="btn-logout">
        Logout
      </button>
    </div>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AuthContext — AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Estado inicial sin sesión ──────────────────────────────────────────

  it('arranca sin autenticar cuando localStorage está vacío', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  // ── Persistencia: carga sesión desde localStorage ──────────────────────

  it('carga la sesión guardada de localStorage al montar', () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Paciente Prueba');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  });

  // ── Función login ──────────────────────────────────────────────────────

  it('login() establece el estado autenticado', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-login'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
  });

  it('login() guarda el token y el usuario en localStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-login'));
    });

    expect(localStorage.getItem('token')).toBe('test-token-abc');
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toMatchObject({
      email: 'prueba@ecosalud.com',
      role: 'PATIENT',
    });
  });

  it('login() actualiza el nombre y rol del usuario en pantalla', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-login'));
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Paciente Prueba');
    expect(screen.getByTestId('user-role')).toHaveTextContent('PATIENT');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token-abc');
  });

  // ── Función logout ─────────────────────────────────────────────────────

  it('logout() limpia el estado de autenticación', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Verificar que está autenticado antes
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-logout'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  it('logout() elimina token y usuario de localStorage', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-logout'));
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  // ── Ciclo completo login → logout ──────────────────────────────────────

  it('ciclo completo: login seguido de logout restablece el estado inicial', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-login'));
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-logout'));
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });
});

// ── useAuthContext fuera del proveedor ─────────────────────────────────────

describe('useAuthContext — fuera del proveedor', () => {
  it('lanza un error descriptivo si se usa fuera de AuthProvider', () => {
    // Suprimimos el error de React para este test específico
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function BareConsumer() {
      useAuthContext();
      return null;
    }

    expect(() => render(<BareConsumer />)).toThrow(
      'useAuthContext must be used within AuthProvider'
    );

    spy.mockRestore();
  });
});
