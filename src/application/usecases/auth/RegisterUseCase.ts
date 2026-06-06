import type { IAuthRepository, RegisterData, AuthResponse } from '../../../domain/repositories/IAuthRepository';

export class RegisterUseCase {
  private readonly authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(data: Omit<RegisterData, 'password'>): Promise<AuthResponse> {
    if (!data.name || !data.email) {
      throw new Error('Nombre y correo son requeridos.');
    }
    return this.authRepository.register(data as RegisterData);
  }
}
