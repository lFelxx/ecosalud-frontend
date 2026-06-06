/// <reference types="vitest/globals" />

import { AuthRepository } from '../../../infrastructure/repositories/AuthRepository';
import type { AuthResponse } from '../../../domain/repositories/IAuthRepository';

// ── Mock de axiosClient ────────────────────────────────────────────────────
// Se mockea todo el módulo para no depender del servidor real

vi.mock('../../../infrastructure/http/axiosClient', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Importar el mock después de configurarlo
import axiosClient from '../../../infrastructure/http/axiosClient';

// ── Datos de prueba ────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@ecosalud.com',
  role: 'PATIENT' as const,
  status: 'ACTIVE' as const,
};

const mockResponse: AuthResponse = {
  token: 'eyJhbGciOiJIUzI1NiJ9.test',
  user: mockUser,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AuthRepository', () => {
  let repo: AuthRepository;

  beforeEach(() => {
    repo = new AuthRepository();
    vi.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('hace POST a /auth/login con las credenciales', async () => {
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      await repo.login({ email: 'test@ecosalud.com', password: 'pass123' });

      expect(axiosClient.post).toHaveBeenCalledOnce();
      expect(axiosClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@ecosalud.com',
        password: 'pass123',
      });
    });

    it('retorna el token y el usuario del servidor', async () => {
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await repo.login({ email: 'test@ecosalud.com', password: 'pass123' });

      expect(result.token).toBe('eyJhbGciOiJIUzI1NiJ9.test');
      expect(result.user.email).toBe('test@ecosalud.com');
      expect(result.user.role).toBe('PATIENT');
    });

    it('propaga el error HTTP del servidor', async () => {
      vi.mocked(axiosClient.post).mockRejectedValueOnce(
        new Error('Request failed with status code 401')
      );

      await expect(
        repo.login({ email: 'wrong@test.com', password: 'badpass' })
      ).rejects.toThrow('Request failed with status code 401');
    });
  });

  // ── register ───────────────────────────────────────────────────────────

  describe('register()', () => {
    it('hace POST a /auth/register con los datos del usuario', async () => {
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

      await repo.register({
        name: 'Test User',
        email: 'test@ecosalud.com',
        password: 'pass123',
      });

      expect(axiosClient.post).toHaveBeenCalledOnce();
      expect(axiosClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@ecosalud.com',
        password: 'pass123',
      });
    });

    it('retorna el token y usuario recién creado', async () => {
      const newUser = { ...mockUser, id: 99, name: 'Nuevo' };
      vi.mocked(axiosClient.post).mockResolvedValueOnce({
        data: { token: 'new-token', user: newUser },
      });

      const result = await repo.register({
        name: 'Nuevo',
        email: 'nuevo@test.com',
        password: 'pass123',
      });

      expect(result.token).toBe('new-token');
      expect(result.user.id).toBe(99);
    });

    it('propaga el error si el email ya existe', async () => {
      vi.mocked(axiosClient.post).mockRejectedValueOnce(
        new Error('Request failed with status code 400')
      );

      await expect(
        repo.register({ name: 'Test', email: 'dup@test.com', password: 'pass' })
      ).rejects.toThrow('Request failed with status code 400');
    });
  });
});
