import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { useAuthContext } from '../context/AuthContext';

const loginUseCase = new LoginUseCase(new AuthRepository());

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    // Mock temporal — se elimina cuando el backend esté activo
    const MOCK_USERS: Record<string, string> = {
      'prueba@ecosalud.com': 'ecosalud123',
      'admin@ecosalud.com': 'admin123',
    };

    if (MOCK_USERS[email.trim()] && MOCK_USERS[email.trim()] === password.trim()) {
      login('mock-token-dev', {
        id: 1,
        name: 'Paciente Prueba',
        email: email.trim(),
        role: 'PATIENT',
        status: 'ACTIVE',
      });
      setLoading(false);
      navigate('/');
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
