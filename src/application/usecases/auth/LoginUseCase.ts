import type { IAuthRepository, LoginCredentials, AuthResponse } from '../../../domain/repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('El correo y la contraseña son requeridos.');
    }
    return this.authRepository.login(credentials);
  }
}
