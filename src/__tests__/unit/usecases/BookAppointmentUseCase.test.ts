/// <reference types="vitest/globals" />

import { BookAppointmentUseCase } from '../../../application/usecases/appointments/BookAppointmentUseCase';
import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

// ── Repositorio falso ──────────────────────────────────────────────────────

const mockAppointmentRepo: IAppointmentRepository = {
  create: vi.fn(),
  getByPatient: vi.fn(),
};

const useCase = new BookAppointmentUseCase(mockAppointmentRepo);

const validData: Omit<Appointment, 'id'> = {
  patientId: 1,
  serviceId: 3,
  date: '2026-07-15',
  time: '10:00',
  status: 'PENDING',
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('BookAppointmentUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validaciones ──────────────────────────────────────────────────────

  it('lanza error si la fecha está vacía', async () => {
    await expect(
      useCase.execute({ ...validData, date: '' })
    ).rejects.toThrow('Fecha, hora y servicio son requeridos.');
  });

  it('lanza error si la hora está vacía', async () => {
    await expect(
      useCase.execute({ ...validData, time: '' })
    ).rejects.toThrow('Fecha, hora y servicio son requeridos.');
  });

  it('lanza error si el serviceId es 0 (falsy)', async () => {
    await expect(
      useCase.execute({ ...validData, serviceId: 0 })
    ).rejects.toThrow('Fecha, hora y servicio son requeridos.');
  });

  // ── Invocación correcta ───────────────────────────────────────────────

  it('llama a appointmentRepository.create con los datos correctos', async () => {
    const created: Appointment = { id: 99, ...validData };
    vi.mocked(mockAppointmentRepo.create).mockResolvedValueOnce(created);

    await useCase.execute(validData);

    expect(mockAppointmentRepo.create).toHaveBeenCalledOnce();
    expect(mockAppointmentRepo.create).toHaveBeenCalledWith(validData);
  });

  it('retorna la cita creada con su id', async () => {
    const created: Appointment = { id: 42, ...validData };
    vi.mocked(mockAppointmentRepo.create).mockResolvedValueOnce(created);

    const result = await useCase.execute(validData);

    expect(result.id).toBe(42);
    expect(result.date).toBe('2026-07-15');
    expect(result.status).toBe('PENDING');
  });

  it('incluye campos opcionales (therapistId, notes)', async () => {
    const dataWithOptionals: Omit<Appointment, 'id'> = {
      ...validData,
      therapistId: 7,
      notes: 'Paciente con dolor lumbar',
    };
    const created: Appointment = { id: 10, ...dataWithOptionals };
    vi.mocked(mockAppointmentRepo.create).mockResolvedValueOnce(created);

    const result = await useCase.execute(dataWithOptionals);

    expect(result.therapistId).toBe(7);
    expect(result.notes).toBe('Paciente con dolor lumbar');
  });

  it('propaga el error del repositorio si la creación falla', async () => {
    vi.mocked(mockAppointmentRepo.create).mockRejectedValueOnce(
      new Error('Sin disponibilidad en esa hora')
    );

    await expect(useCase.execute(validData)).rejects.toThrow(
      'Sin disponibilidad en esa hora'
    );
  });
});
