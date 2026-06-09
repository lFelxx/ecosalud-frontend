/// <reference types="vitest/globals" />

import { LoginUseCase } from '../../../application/usecases/auth/LoginUseCase';
import type {
  IAuthRepository,
  AuthResponse,
} from '../../../domain/repositories/IAuthRepository';

// ── Repositorio falso ──────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  name: 'Paciente Prueba',
  email: 'prueba@ecosalud.com',
  role: 'PATIENT' as const,
  status: 'ACTIVE' as const,
};

const mockAuthRepo: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
};

const useCase = new LoginUseCase(mockAuthRepo);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoginUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validaciones de campos requeridos ──────────────────────────────────

  it('lanza error si el email está vacío', async () => {
    await expect(
      useCase.execute({ email: '', password: 'pass123' })
    ).rejects.toThrow('El correo y la contraseña son requeridos.');
  });

  it('lanza error si la contraseña está vacía', async () => {
    await expect(
      useCase.execute({ email: 'user@test.com', password: '' })
    ).rejects.toThrow('El correo y la contraseña son requeridos.');
  });

  it('lanza error si ambos campos están vacíos', async () => {
    await expect(
      useCase.execute({ email: '', password: '' })
    ).rejects.toThrow('El correo y la contraseña son requeridos.');
  });

  // ── Invocación correcta del repositorio ───────────────────────────────

  it('llama a authRepository.login con las credenciales correctas', async () => {
    const mockResponse: AuthResponse = { token: 'tok-abc', user: mockUser };
    vi.mocked(mockAuthRepo.login).mockResolvedValueOnce(mockResponse);

    await useCase.execute({ email: 'prueba@ecosalud.com', password: 'ecosalud123' });

    expect(mockAuthRepo.login).toHaveBeenCalledOnce();
    expect(mockAuthRepo.login).toHaveBeenCalledWith({
      email: 'prueba@ecosalud.com',
      password: 'ecosalud123',
    });
  });

  it('retorna la respuesta del repositorio con token y usuario', async () => {
    const mockResponse: AuthResponse = { token: 'tok-xyz', user: mockUser };
    vi.mocked(mockAuthRepo.login).mockResolvedValueOnce(mockResponse);

    const result = await useCase.execute({
      email: 'prueba@ecosalud.com',
      password: 'ecosalud123',
    });

    expect(result).toEqual(mockResponse);
    expect(result.token).toBe('tok-xyz');
    expect(result.user.role).toBe('PATIENT');
  });

  it('propaga el error del repositorio si el login falla', async () => {
    vi.mocked(mockAuthRepo.login).mockRejectedValueOnce(
      new Error('Credenciales inválidas')
    );

    await expect(
      useCase.execute({ email: 'x@x.com', password: 'wrong' })
    ).rejects.toThrow('Credenciales inválidas');
  });
});
