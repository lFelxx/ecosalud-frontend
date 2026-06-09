/// <reference types="vitest/globals" />

/**
 * PRUEBA DE INTEGRACIÓN 1 — Flujo de Login vía API HTTP
 *
 * Qué se testea:
 *   UI/hook → LoginUseCase → AuthRepository → axiosClient → [MSW] → API
 *
 * Diferencia con las pruebas unitarias existentes:
 *   - NO se mockea LoginUseCase, ni AuthRepository, ni axiosClient.
 *   - Solo la capa de red es interceptada por MSW (Mock Service Worker).
 *   - Se usan credenciales distintas al MOCK_DB interno de useLogin,
 *     forzando el camino real hacia el backend.
 *
 * Endpoints cubiertos:
 *   POST /api/auth/login  →  200 OK  (credenciales válidas)
 *   POST /api/auth/login  →  401     (credenciales inválidas)
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import { useLogin } from '../../../presentation/hooks/useLogin';
import { server } from '../../../test/mswServer';
import { API_TEST_USER } from '../../../test/mswHandlers';

// ── Ciclo de vida del servidor MSW ─────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());   // limpia overrides por test
afterAll(() => server.close());

// ── Componente consumidor (sin ningún mock de módulo) ──────────────────────
// Usa el hook real → cadena completa de capas.
// Las credenciales NO están en el MOCK_DB interno de useLogin,
// por lo que el hook llama a LoginUseCase.execute() → AuthRepository → HTTP.

function LoginConsumer() {
  const { handleLogin, loading, error } = useLogin();
  return (
    <div>
      <span data-testid="status">
        {loading ? 'cargando' : error ?? 'listo'}
      </span>
      <button
        data-testid="btn-ok"
        onClick={() =>
          handleLogin(API_TEST_USER.email, API_TEST_USER.password)
        }
      >
        Login correcto
      </button>
      <button
        data-testid="btn-fail"
        onClick={() => handleLogin('nadie@noexiste.com', 'wrongpass')}
      >
        Login incorrecto
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

describe('Integración API — Login Flow (MSW)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Test 1.1
   * Verifica que, ante una respuesta 200 del backend,
   * el JWT queda guardado en localStorage y el estado es "listo".
   */
  it('guarda el JWT en localStorage cuando el API responde 200', async () => {
    render(<LoginConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-ok'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('listo');
    });

    // El token que devuelve MSW debe estar en localStorage
    expect(localStorage.getItem('token')).toBe(API_TEST_USER.token);
  });

  /**
   * Test 1.2
   * Verifica que el objeto de usuario devuelto por la API
   * se guarda correctamente en localStorage con su rol y email.
   */
  it('persiste los datos del usuario (email y rol) devueltos por la API', async () => {
    render(<LoginConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-ok'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('listo');
    });

    const storedUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    expect(storedUser.email).toBe(API_TEST_USER.email);
    expect(storedUser.role).toBe('PATIENT');
    expect(storedUser.id).toBe(API_TEST_USER.user.id);
  });

  /**
   * Test 1.3
   * Verifica que cuando el API responde 401 (credenciales incorrectas),
   * el hook expone el error y NO almacena ningún token.
   */
  it('no guarda token y muestra error cuando el API responde 401', async () => {
    render(<LoginConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-fail'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).not.toHaveTextContent('cargando');
    });

    // Sin token guardado
    expect(localStorage.getItem('token')).toBeNull();
    // El estado muestra el mensaje de error
    expect(screen.getByTestId('status')).not.toHaveTextContent('listo');
  });
});
