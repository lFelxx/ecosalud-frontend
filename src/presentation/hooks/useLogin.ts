import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { useAuthContext } from '../context/AuthContext';

const loginUseCase = new LoginUseCase(new AuthRepository());

// Mock temporal — se reemplaza cuando el backend esté activo
const MOCK_DB: Record<string, { id: number; name: string; role: 'PATIENT' | 'EDITOR' | 'ADMIN'; password: string }> = {
  'admin@ecosalud.com': { id: 2, name: 'Angélica Camacho', role: 'ADMIN', password: 'admin123' },
  'editor@ecosalud.com': { id: 3, name: 'Editor Ecosalud', role: 'EDITOR', password: 'editor123' },
  'prueba@ecosalud.com': { id: 1, name: 'Paciente Prueba', role: 'PATIENT', password: 'ecosalud123' },
};

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const mockUser = MOCK_DB[email.trim()];
    if (mockUser && mockUser.password === password.trim()) {
      login(`mock-token-${mockUser.role.toLowerCase()}`, {
        id: mockUser.id,
        name: mockUser.name,
        email: email.trim(),
        role: mockUser.role,
        status: 'ACTIVE',
      });
      setLoading(false);
      // Redirigir al panel si es admin/editor
      navigate(mockUser.role !== 'PATIENT' ? '/admin' : '/');
      return;
    }

    try {
      const response = await loginUseCase.execute({ email: email.trim(), password: password.trim() });
      login(response.token, response.user);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Correo o contraseña incorrectos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
