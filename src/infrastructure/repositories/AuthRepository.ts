import axiosClient from '../http/axiosClient';
import type { IAuthRepository, LoginCredentials, RegisterData, AuthResponse } from '../../domain/repositories/IAuthRepository';

// Shape real que devuelve el backend Spring Boot
interface BackendLoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
  tenantSchema?: string | null;
}

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosClient.post<BackendLoginResponse>('/auth/login', credentials);
    return {
      token: data.token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as AuthResponse['user']['role'],
        status: 'ACTIVE',
        tenantSchema: data.tenantSchema ?? null,
      },
    };
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await axiosClient.post<BackendLoginResponse>('/auth/register', registerData);
    return {
      token: data.token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as AuthResponse['user']['role'],
        status: 'ACTIVE',
        tenantSchema: data.tenantSchema ?? null,
      },
    };
  }
}
