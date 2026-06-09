/// <reference types="vitest/globals" />

/**
 * PRUEBA DE INTEGRACIÓN 3 — Flujo de Citas (Reserva y Consulta) vía API
 *
 * Qué se testea:
 *   BookAppointmentUseCase → AppointmentRepository → axiosClient → [MSW] → API
 *   GetAppointmentsUseCase → AppointmentRepository → axiosClient → [MSW] → API
 *
 * Diferencia clave:
 *   - AppointmentRepository NO estaba cubierto en las pruebas anteriores.
 *   - Aquí ejercitamos su método create() y getByPatient() con HTTP real
 *     (interceptado por MSW), verificando que los datos viajan correctamente
 *     entre capas y que la respuesta del API es procesada sin pérdida.
 *
 * Endpoints cubiertos:
 *   POST /api/appointments              →  201 Created
 *   GET  /api/appointments/patient/:id  →  200 OK  (lista de citas)
 */

import { server } from '../../../test/mswServer';
import { TEST_APPOINTMENT } from '../../../test/mswHandlers';
import { AppointmentRepository } from '../../../infrastructure/repositories/AppointmentRepository';
import { BookAppointmentUseCase } from '../../../application/usecases/appointments/BookAppointmentUseCase';
import { GetAppointmentsUseCase } from '../../../application/usecases/appointments/GetAppointmentsUseCase';

// ── Ciclo de vida del servidor MSW ─────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Instancias reales (sin ningún vi.mock) ─────────────────────────────────
// AppointmentRepository usa axiosClient internamente.
// MSW intercepta las llamadas HTTP que axiosClient genera.
const appointmentRepo = new AppointmentRepository();
const bookUseCase = new BookAppointmentUseCase(appointmentRepo);
const getUseCase = new GetAppointmentsUseCase(appointmentRepo);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Integración API — Appointment Flow (MSW)', () => {
  beforeEach(() => {
    // Simula usuario autenticado para el interceptor de Authorization
    localStorage.setItem('token', 'test-bearer-token');
  });

  /**
   * Test 3.1
   * Verifica que BookAppointmentUseCase.execute() envía los datos al API
   * y devuelve la cita creada con el ID asignado por el servidor.
   */
  it('reserva una cita y recibe el ID asignado por el servidor', async () => {
    const created = await bookUseCase.execute({
      patientId: TEST_APPOINTMENT.patientId,
      serviceId: TEST_APPOINTMENT.serviceId,
      therapistId: TEST_APPOINTMENT.therapistId,
      date: TEST_APPOINTMENT.date,
      time: TEST_APPOINTMENT.time,
      status: 'PENDING',
      notes: TEST_APPOINTMENT.notes,
    });

    // El handler de MSW asigna id: 42 y status: 'PENDING'
    expect(created.id).toBe(42);
    expect(created.status).toBe('PENDING');
    expect(created.date).toBe(TEST_APPOINTMENT.date);
    expect(created.time).toBe(TEST_APPOINTMENT.time);
  });

  /**
   * Test 3.2
   * Verifica que GetAppointmentsUseCase.execute() obtiene la lista
   * de citas de un paciente y la devuelve correctamente tipada.
   */
  it('obtiene la lista de citas de un paciente desde el API', async () => {
    const appointments = await getUseCase.execute(99);

    // El handler de MSW devuelve 2 citas para cualquier patientId
    expect(appointments).toHaveLength(2);
    expect(appointments[0].patientId).toBe(99);
    expect(appointments[0].status).toBe('CONFIRMED');
    expect(appointments[1].status).toBe('PENDING');
  });

  /**
   * Test 3.3
   * Verifica que axiosClient adjunta el header Authorization: Bearer <token>
   * en cada petición. MSW permite inspeccionar los headers recibidos
   * añadiendo un override al servidor solo para este test.
   */
  it('envía el header Authorization con el JWT del usuario autenticado', async () => {
    const { http, HttpResponse } = await import('msw');

    let capturedAuthHeader: string | null = null;

    // Override del handler solo para este test: captura el header
    server.use(
      http.post('http://localhost:8080/api/appointments', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization');
        return HttpResponse.json(
          { id: 99, status: 'PENDING', ...TEST_APPOINTMENT },
          { status: 201 }
        );
      })
    );

    await bookUseCase.execute({
      patientId: TEST_APPOINTMENT.patientId,
      serviceId: TEST_APPOINTMENT.serviceId,
      date: TEST_APPOINTMENT.date,
      time: TEST_APPOINTMENT.time,
      status: 'PENDING',
    });

    expect(capturedAuthHeader).toBe('Bearer test-bearer-token');
  });
});
