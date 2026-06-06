/// <reference types="vitest/globals" />

/**
 * PRUEBA DE INTEGRACIÓN 2 — Flujo de Registro vía API HTTP
 *
 * Qué se testea:
 *   UI/hook → RegisterUseCase → AuthRepository → axiosClient → [MSW] → API
 *
 * Comportamientos verificados:
 *   - Registro exitoso: token y usuario guardados en localStorage.
 *   - El hook concatena name + lastName antes de enviarlo al API.
 *   - Registro con email duplicado: el API responde 409 y el hook
 *     expone el mensaje de error (sin guardar token).
 *
 * Endpoints cubiertos:
 *   POST /api/auth/register  →  201 Created   (email nuevo)
 *   POST /api/auth/register  →  409 Conflict  (email duplicado)
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import { useRegister } from '../../../presentation/hooks/useRegister';
import { server } from '../../../test/mswServer';
import { REGISTER_TEST_USER } from '../../../test/mswHandlers';

// ── Ciclo de vida del servidor MSW ─────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Datos de prueba ────────────────────────────────────────────────────────
const NEW_USER = {
  name: 'Carlos',
  lastName: 'Nuevo',
  email: REGISTER_TEST_USER.email,
  therapy: 'Acupuntura',
  healthGoal: 'Reducir el estrés',
};

// ── Componente consumidor (sin mocks de módulo) ────────────────────────────
function RegisterConsumer({ email }: { email?: string }) {
  const { handleRegister, loading, error } = useRegister();
  return (
    <div>
      <span data-testid="status">
        {loading ? 'cargando' : error ?? 'listo'}
      </span>
      <button
        data-testid="btn-register"
        onClick={() =>
          handleRegister({ ...NEW_USER, email: email ?? NEW_USER.email })
        }
      >
        Registrarse
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

describe('Integración API — Register Flow (MSW)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Test 2.1
   * Verifica que ante un 201 del backend, el JWT queda en localStorage
   * y el estado del hook vuelve a "listo" (sin errores).
   */
  it('guarda el JWT en localStorage cuando el API responde 201', async () => {
    render(<RegisterConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('listo');
    });

    expect(localStorage.getItem('token')).toBe(REGISTER_TEST_USER.token);
  });

  /**
   * Test 2.2
   * Verifica que el hook combina name + lastName en un solo campo
   * "name" antes de enviarlo al API, tal como espera el backend.
   * MSW captura el cuerpo de la petición y lo refleja en la respuesta;
   * comprobamos que el usuario guardado tiene el nombre concatenado.
   */
  it('envía name + lastName concatenados al API y guarda el usuario correctamente', async () => {
    render(<RegisterConsumer />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('listo');
    });

    const storedUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    // El handler de MSW devuelve el name tal como lo recibió → "Carlos Nuevo"
    expect(storedUser.name).toBe('Carlos Nuevo');
    expect(storedUser.email).toBe(NEW_USER.email);
  });

  /**
   * Test 2.3
   * Verifica que cuando el API responde 409 (email duplicado),
   * el hook no guarda token y expone el mensaje de error.
   */
  it('no guarda token y muestra error cuando el API responde 409 (email duplicado)', async () => {
    render(
      <RegisterConsumer email="existente@clinic.com" />,
      { wrapper: Wrapper }
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-register'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).not.toHaveTextContent('cargando');
    });

    expect(localStorage.getItem('token')).toBeNull();
    // El status muestra el mensaje de error (no "listo")
    expect(screen.getByTestId('status')).not.toHaveTextContent('listo');
  });
});
