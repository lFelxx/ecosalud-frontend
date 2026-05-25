import type { IAuthRepository, RegisterData, AuthResponse } from '../../../domain/repositories/IAuthRepository';

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    if (!data.name || !data.email || !data.password) {
      throw new Error('Nombre, correo y contraseña son requeridos.');
    }
    if (data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    return this.authRepository.register(data);
  }
}
