/// <reference types="vitest/globals" />

import { RegisterUseCase } from '../../../application/usecases/auth/RegisterUseCase';
import type {
  IAuthRepository,
  AuthResponse,
} from '../../../domain/repositories/IAuthRepository';

// ── Repositorio falso ──────────────────────────────────────────────────────

const mockUser = {
  id: 5,
  name: 'Nuevo Paciente',
  email: 'nuevo@ecosalud.com',
  role: 'PATIENT' as const,
  status: 'ACTIVE' as const,
};

const mockAuthRepo: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
};

const useCase = new RegisterUseCase(mockAuthRepo);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validaciones de campos requeridos ──────────────────────────────────

  it('lanza error si el nombre está vacío', async () => {
    await expect(
      useCase.execute({ name: '', email: 'a@a.com', password: 'pass123' })
    ).rejects.toThrow('Nombre, correo y contraseña son requeridos.');
  });

  it('lanza error si el email está vacío', async () => {
    await expect(
      useCase.execute({ name: 'Juan', email: '', password: 'pass123' })
    ).rejects.toThrow('Nombre, correo y contraseña son requeridos.');
  });

  it('lanza error si la contraseña está vacía', async () => {
    await expect(
      useCase.execute({ name: 'Juan', email: 'j@j.com', password: '' })
    ).rejects.toThrow('Nombre, correo y contraseña son requeridos.');
  });

  // ── Validación de longitud de contraseña ──────────────────────────────

  it('lanza error si la contraseña tiene menos de 6 caracteres', async () => {
    await expect(
      useCase.execute({ name: 'Juan', email: 'j@j.com', password: '12345' })
    ).rejects.toThrow('La contraseña debe tener al menos 6 caracteres.');
  });

  it('acepta contraseña de exactamente 6 caracteres', async () => {
    const mockResponse: AuthResponse = { token: 'tok', user: mockUser };
    vi.mocked(mockAuthRepo.register).mockResolvedValueOnce(mockResponse);

    await expect(
      useCase.execute({ name: 'Juan', email: 'j@j.com', password: '123456' })
    ).resolves.toBeDefined();
  });

  // ── Invocación correcta del repositorio ───────────────────────────────

  it('llama a authRepository.register con los datos correctos', async () => {
    const mockResponse: AuthResponse = { token: 'tok-reg', user: mockUser };
    vi.mocked(mockAuthRepo.register).mockResolvedValueOnce(mockResponse);

    await useCase.execute({
      name: 'Nuevo Paciente',
      email: 'nuevo@ecosalud.com',
      password: 'segura123',
    });

    expect(mockAuthRepo.register).toHaveBeenCalledOnce();
    expect(mockAuthRepo.register).toHaveBeenCalledWith({
      name: 'Nuevo Paciente',
      email: 'nuevo@ecosalud.com',
      password: 'segura123',
    });
  });

  it('retorna el token y el usuario del repositorio', async () => {
    const mockResponse: AuthResponse = { token: 'tok-new', user: mockUser };
    vi.mocked(mockAuthRepo.register).mockResolvedValueOnce(mockResponse);

    const result = await useCase.execute({
      name: 'Nuevo Paciente',
      email: 'nuevo@ecosalud.com',
      password: 'segura123',
    });

    expect(result.token).toBe('tok-new');
    expect(result.user.email).toBe('nuevo@ecosalud.com');
  });

  it('propaga el error del repositorio si el registro falla', async () => {
    vi.mocked(mockAuthRepo.register).mockRejectedValueOnce(
      new Error('El email ya está registrado')
    );

    await expect(
      useCase.execute({ name: 'Ana', email: 'a@a.com', password: 'pass123' })
    ).rejects.toThrow('El email ya está registrado');
  });

  // ── Campos opcionales ─────────────────────────────────────────────────

  it('acepta el campo phone opcional', async () => {
    const mockResponse: AuthResponse = { token: 'tok', user: mockUser };
    vi.mocked(mockAuthRepo.register).mockResolvedValueOnce(mockResponse);

    await expect(
      useCase.execute({
        name: 'Ana',
        email: 'a@a.com',
        password: 'pass123',
        phone: '3001234567',
      })
    ).resolves.toBeDefined();

    expect(mockAuthRepo.register).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '3001234567' })
    );
  });
});
