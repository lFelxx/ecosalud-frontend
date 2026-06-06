/// <reference types="vitest/globals" />

import { GetAppointmentsUseCase } from '../../../application/usecases/appointments/GetAppointmentsUseCase';
import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

// ── Repositorio falso ──────────────────────────────────────────────────────

const mockAppointmentRepo: IAppointmentRepository = {
  create: vi.fn(),
  getByPatient: vi.fn(),
};

const useCase = new GetAppointmentsUseCase(mockAppointmentRepo);

// ── Datos de prueba ────────────────────────────────────────────────────────

const sampleAppointments: Appointment[] = [
  { id: 1, patientId: 5, serviceId: 2, date: '2026-06-01', time: '09:00', status: 'CONFIRMED' },
  { id: 2, patientId: 5, serviceId: 3, date: '2026-06-15', time: '14:00', status: 'PENDING' },
  { id: 3, patientId: 5, serviceId: 1, date: '2026-05-20', time: '10:30', status: 'COMPLETED', notes: 'Muy bien' },
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GetAppointmentsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a appointmentRepository.getByPatient con el patientId correcto', async () => {
    vi.mocked(mockAppointmentRepo.getByPatient).mockResolvedValueOnce([]);

    await useCase.execute(5);

    expect(mockAppointmentRepo.getByPatient).toHaveBeenCalledOnce();
    expect(mockAppointmentRepo.getByPatient).toHaveBeenCalledWith(5);
  });

  it('retorna la lista de citas del paciente', async () => {
    vi.mocked(mockAppointmentRepo.getByPatient).mockResolvedValueOnce(sampleAppointments);

    const result = await useCase.execute(5);

    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('CONFIRMED');
    expect(result[2].notes).toBe('Muy bien');
  });

  it('retorna lista vacía si el paciente no tiene citas', async () => {
    vi.mocked(mockAppointmentRepo.getByPatient).mockResolvedValueOnce([]);

    const result = await useCase.execute(999);

    expect(result).toEqual([]);
  });

  it('propaga el error si el repositorio falla', async () => {
    vi.mocked(mockAppointmentRepo.getByPatient).mockRejectedValueOnce(
      new Error('Error de conexión')
    );

    await expect(useCase.execute(1)).rejects.toThrow('Error de conexión');
  });

  it('funciona con diferentes IDs de paciente', async () => {
    const citas: Appointment[] = [
      { id: 10, patientId: 99, serviceId: 1, date: '2026-07-01', time: '08:00', status: 'PENDING' },
    ];
    vi.mocked(mockAppointmentRepo.getByPatient).mockResolvedValueOnce(citas);

    const result = await useCase.execute(99);

    expect(mockAppointmentRepo.getByPatient).toHaveBeenCalledWith(99);
    expect(result[0].patientId).toBe(99);
  });
});
