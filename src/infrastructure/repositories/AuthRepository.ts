import axiosClient from '../http/axiosClient';
import type { IAuthRepository, LoginCredentials, RegisterData, AuthResponse } from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/entities/User';

interface BackendLoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

// El backend usa USER; el frontend usa PATIENT
function mapRole(role: string): User['role'] {
  if (role === 'USER') return 'PATIENT';
  return role as User['role'];
}

// El enum UserStatus del backend está en español (ACTIVO/INACTIVO)
function mapStatus(status: string): User['status'] {
  if (status === 'ACTIVO')   return 'ACTIVE';
  if (status === 'INACTIVO') return 'INACTIVE';
  return status as User['status'];
}

function toAuthResponse(raw: BackendLoginResponse): AuthResponse {
  const user: User = {
    id:     raw.id,
    name:   raw.name,
    email:  raw.email,
    role:   mapRole(raw.role),
    status: mapStatus(raw.status),
  };
  return { token: raw.token, user };
}

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosClient.post<BackendLoginResponse>('/auth/login', credentials);
    return toAuthResponse(data);
  }

  // El backend registra en /user/register (retorna UserDTO sin token),
  // luego se hace login automático para obtener el token.
  async register(registerData: RegisterData): Promise<AuthResponse> {
    await axiosClient.post('/user/register', {
      name:     registerData.name,
      email:    registerData.email,
      password: registerData.password,
    });
    return this.login({ email: registerData.email, password: registerData.password });
  }
}
