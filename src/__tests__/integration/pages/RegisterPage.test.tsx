/// <reference types="vitest/globals" />

import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../presentation/context/AuthContext';
import RegisterPage from '../../../presentation/pages/auth/RegisterPage';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockHandleRegister = vi.fn();

vi.mock('../../../presentation/hooks/useRegister', () => ({
  useRegister: () => ({
    handleRegister: mockHandleRegister,
    loading: false,
    error: null,
  }),
}));

vi.mock('../../../assets/doctor-hero.jpg', () => ({ default: 'doctor.jpg' }));

// ── Helpers ───────────────────────────────────────────────────────────────

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterPage — integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renderizado básico ─────────────────────────────────────────────────

  it('renderiza la página sin errores (smoke test)', () => {
    const { container } = renderRegisterPage();
    expect(container.firstChild).toBeTruthy();
  });

  it('renderiza el campo de nombre', () => {
    // Placeholder real: "Ej. Juan"
    renderRegisterPage();
    const nameInput = screen.getByPlaceholderText('Ej. Juan');
    expect(nameInput).toBeInTheDocument();
  });

  it('renderiza el campo de apellido', () => {
    // Placeholder real: "Ej. Pérez"
    renderRegisterPage();
    const lastNameInput = screen.getByPlaceholderText('Ej. Pérez');
    expect(lastNameInput).toBeInTheDocument();
  });

  it('renderiza el campo de correo electrónico', () => {
    // Placeholder real: "tu@email.com"
    renderRegisterPage();
    const emailInput = screen.getByPlaceholderText('tu@email.com');
    expect(emailInput).toBeInTheDocument();
  });

  it('renderiza el botón de registro', () => {
    // Texto real del botón: "Completar Registro"
    const { container } = renderRegisterPage();
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveTextContent('Completar Registro');
  });

  it('renderiza el enlace de regreso al login', () => {
    renderRegisterPage();
    const loginLink = screen.getByRole('link', { name: /inicia sesión/i });
    expect(loginLink).toBeInTheDocument();
  });

  it('muestra las opciones de terapia', () => {
    renderRegisterPage();
    expect(screen.getByText('Acupuntura')).toBeInTheDocument();
    expect(screen.getByText('Sueroterapia')).toBeInTheDocument();
    expect(screen.getByText('Ozonoterapia')).toBeInTheDocument();
  });

  // ── Interacción ────────────────────────────────────────────────────────

  it('actualiza el campo nombre al escribir', () => {
    renderRegisterPage();
    const nameInput = screen.getByPlaceholderText('Ej. Juan');

    fireEvent.change(nameInput, { target: { value: 'María' } });

    expect(nameInput).toHaveValue('María');
  });

  it('actualiza el campo apellido al escribir', () => {
    renderRegisterPage();
    const lastNameInput = screen.getByPlaceholderText('Ej. Pérez');

    fireEvent.change(lastNameInput, { target: { value: 'García' } });

    expect(lastNameInput).toHaveValue('García');
  });

  it('actualiza el campo email al escribir', () => {
    renderRegisterPage();
    const emailInput = screen.getByPlaceholderText('tu@email.com');

    fireEvent.change(emailInput, { target: { value: 'maria@test.com' } });

    expect(emailInput).toHaveValue('maria@test.com');
  });

  it('llama a handleRegister al enviar el formulario con datos válidos', async () => {
    const { container } = renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Ej. Juan'), {
      target: { value: 'María' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej. Pérez'), {
      target: { value: 'García' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'maria@ecosalud.com' },
    });

    const form = container.querySelector('form');

    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(mockHandleRegister).toHaveBeenCalledOnce();
    expect(mockHandleRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'María',
        lastName: 'García',
        email: 'maria@ecosalud.com',
      })
    );
  });
});
