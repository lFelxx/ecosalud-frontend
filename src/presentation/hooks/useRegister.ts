import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { RegisterUseCase } from '../../application/usecases/auth/RegisterUseCase';
import { useAuthContext } from '../context/AuthContext';

const registerUseCase = new RegisterUseCase(new AuthRepository());

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleRegister = async (data: {
    name: string;
    lastName: string;
    email: string;
    therapy?: string;
    healthGoal?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUseCase.execute({
        name: `${data.name} ${data.lastName}`.trim(),
        email: data.email,
        password: 'temporal123',
      });
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
}
