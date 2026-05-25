import axiosClient from '../http/axiosClient';
import type { IAuthRepository, LoginCredentials, RegisterData, AuthResponse } from '../../domain/repositories/IAuthRepository';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>('/auth/register', registerData);
    return data;
  }
}
