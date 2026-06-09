import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { useAuthContext } from '../context/AuthContext';

const loginUseCase = new LoginUseCase(new AuthRepository());

// Admin y editor permanecen mockeados; los pacientes usan el backend real
const STAFF_MOCK: Record<string, { id: number; name: string; role: 'ADMIN' | 'EDITOR'; password: string }> = {
  'admin@ecosalud.com':  { id: 2, name: 'Angélica Camacho', role: 'ADMIN',  password: 'admin123'  },
  'editor@ecosalud.com': { id: 3, name: 'Editor Ecosalud',  role: 'EDITOR', password: 'editor123' },
};

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const staffUser = STAFF_MOCK[email.trim()];
    if (staffUser && staffUser.password === password.trim()) {
      login(`mock-token-${staffUser.role.toLowerCase()}`, {
        id: staffUser.id,
        name: staffUser.name,
        email: email.trim(),
        role: staffUser.role,
        status: 'ACTIVE',
      });
      setLoading(false);
      navigate('/admin');
      return;
    }

    try {
      const response = await loginUseCase.execute({ email: email.trim(), password: password.trim() });
      login(response.token, response.user);
      const role = response.user.role;
      navigate(role === 'ADMIN' || role === 'THERAPIST' ? '/admin' : '/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Correo o contraseña incorrectos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
