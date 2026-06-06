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
    try {
      const response = await loginUseCase.execute({ email: email.trim(), password: password.trim() });
      login(response.token, response.user);
      if (response.user.role === 'ADMIN' && !response.user.tenantSchema) {
        navigate('/superadmin');
      } else if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Correo o contraseña incorrectos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
