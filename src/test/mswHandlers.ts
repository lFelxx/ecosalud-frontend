/**
 * Handlers de MSW (Mock Service Worker) para las pruebas de integración.
 *
 * Simulan las respuestas del backend de EcoSalud sin necesidad de que
 * el servidor Java esté corriendo. Los handlers interceptan a nivel
 * de red (XMLHttpRequest / fetch) — el código de producción no se modifica.
 *
 * URL base: http://localhost:8080/api  (VITE_API_URL en setup.ts)
 */

import { http, HttpResponse } from 'msw';

const API = 'http://localhost:8080/api';

// ── Credenciales de prueba (distintas del MOCK_DB interno de useLogin) ─────
// useLogin tiene su propia DB de demo (admin/editor/prueba@ecosalud.com).
// Para ejercitar el camino real → AuthRepository → axiosClient → API,
// usamos un usuario que NO está en esa DB.
export const API_TEST_USER = {
  email: 'maria.api@clinic.com',
  password: 'apiPass2024',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.api-test-token',
  user: {
    id: 99,
    name: 'María API',
    email: 'maria.api@clinic.com',
    role: 'PATIENT' as const,
    status: 'ACTIVE' as const,
  },
};

export const REGISTER_TEST_USER = {
  name: 'Carlos Nuevo',
  email: 'carlos.nuevo@clinic.com',
  password: 'temporal123',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.register-test-token',
};

export const TEST_APPOINTMENT = {
  patientId: 99,
  serviceId: 3,
  therapistId: 1,
  date: '2026-07-15',
  time: '10:00',
  notes: 'Primera consulta de acupuntura',
};

// ── Handlers ───────────────────────────────────────────────────────────────

export const handlers = [

  // POST /auth/login
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (
      body.email === API_TEST_USER.email &&
      body.password === API_TEST_USER.password
    ) {
      return HttpResponse.json(
        { token: API_TEST_USER.token, user: API_TEST_USER.user },
        { status: 200 }
      );
    }

    // Credenciales incorrectas
    return HttpResponse.json(
      { message: 'Correo o contraseña incorrectos.' },
      { status: 401 }
    );
  }),

  // POST /auth/register
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      name: string;
      email: string;
      password: string;
    };

    // Simula email ya registrado
    if (body.email === 'existente@clinic.com') {
      return HttpResponse.json(
        { message: 'El correo ya está registrado.' },
        { status: 409 }
      );
    }

    return HttpResponse.json(
      {
        token: REGISTER_TEST_USER.token,
        user: {
          id: 100,
          name: body.name,
          email: body.email,
          role: 'PATIENT' as const,
          status: 'ACTIVE' as const,
        },
      },
      { status: 201 }
    );
  }),

  // POST /appointments
  http.post(`${API}/appointments`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    return HttpResponse.json(
      { id: 42, ...body, status: 'PENDING' },
      { status: 201 }
    );
  }),

  // GET /appointments/patient/:patientId
  http.get(`${API}/appointments/patient/:patientId`, ({ params }) => {
    const { patientId } = params;
    return HttpResponse.json([
      {
        id: 10,
        patientId: Number(patientId),
        serviceId: 2,
        date: '2026-06-20',
        time: '09:00',
        status: 'CONFIRMED',
      },
      {
        id: 11,
        patientId: Number(patientId),
        serviceId: 3,
        date: '2026-07-01',
        time: '11:30',
        status: 'PENDING',
      },
    ]);
  }),
];
