import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../../infrastructure/http/axiosClient';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ServiceData {
  id: string;
  name: string;
  category: string;
  description: string;
  benefitsText: string[];
  duration: string;
  price: string;
  imageBase64?: string;
}

export interface PostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageBase64?: string;
  status: 'draft' | 'published';
  tags: string[];
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  /** URL pública devuelta por el servidor para renderizar la imagen. */
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'PATIENT' | 'EDITOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

export interface SpecialistData {
  name: string;
  badge: string;
  specialty: string;
  university: string;
  bio: string;
  credential1: string;
  credential2: string;
  photoBase64?: string;
}

export interface AppointmentData {
  id: string;
  patientId: number;
  patientName: string;
  patientEmail: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TherapyPlanData {
  id: string;
  patientId: number;
  patientName: string;
  patientEmail: string;
  service: string;
  sessionsTotal: number;
  sessionsCompleted: number;
  startDate: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Historia clínica electrónica — Res. 1995/1999 MinSalud.
 * Campos obligatorios: reasonForConsultation y diagnosis.
 */
export interface HealthRecordData {
  id: string;
  patientId: number;
  patientName: string;
  appointmentId?: number | null;
  specialistId?: number | null;
  /** Motivo de consulta — OBLIGATORIO */
  reasonForConsultation: string;
  /** Enfermedad actual / anamnesis */
  currentIllness?: string;
  /** Examen físico */
  physicalExam?: string;
  /** Diagnóstico — OBLIGATORIO */
  diagnosis: string;
  /** Plan de tratamiento */
  treatmentPlan?: string;
  /** Observaciones adicionales */
  observations?: string;
  /** Próxima cita sugerida (ISO date YYYY-MM-DD) */
  nextAppointment?: string;
  /** Historia bloqueada — no puede editarse ni eliminarse (inmutable) */
  locked: boolean;
  hashIntegrity?: string;
  createdBy?: number | null;
  createdAt: string;
  updatedAt?: string;
}

// ── Mappers backend ↔ frontend ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceFromApi(s: any): ServiceData {
  return {
    id: String(s.id),
    name: s.name ?? '',
    category: s.category ?? '',
    description: s.description ?? '',
    benefitsText: s.benefits ? s.benefits.split('\n').filter(Boolean) : [],
    duration: s.durationMinutes ? `${s.durationMinutes} min` : '',
    price: s.priceCop ? `$${Number(s.priceCop).toLocaleString('es-CO')} COP` : '',
    imageBase64: s.imageUrl ?? undefined,
  };
}

function serviceToApi(patch: Partial<ServiceData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  if (patch.name !== undefined) result.name = patch.name;
  if (patch.category !== undefined) result.category = patch.category;
  if (patch.description !== undefined) result.description = patch.description;
  if (patch.benefitsText !== undefined) result.benefits = patch.benefitsText.join('\n');
  if (patch.duration !== undefined) result.durationMinutes = parseInt(patch.duration) || null;
  if (patch.price !== undefined) result.priceCop = parseFloat(patch.price.replace(/[^0-9]/g, '')) || null;
  if (patch.imageBase64 !== undefined) result.imageUrl = patch.imageBase64;
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postFromApi(p: any): PostData {
  return {
    id: String(p.id),
    title: p.title ?? '',
    excerpt: p.excerpt ?? '',
    content: p.content ?? '',
    imageBase64: p.imageUrl ?? undefined,
    status: p.status === 'published' ? 'published' : 'draft',
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    authorId: p.authorId ?? 0,
    authorName: p.authorName ?? '',
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
    publishedAt: p.publishedAt ?? undefined,
  };
}

function postToApi(data: Partial<PostData> & { title?: string }) {
  return {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    imageUrl: data.imageBase64,
    status: data.status,
    tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
    authorId: data.authorId,
    authorName: data.authorName,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function appointmentFromApi(a: any): AppointmentData {
  const statusMap: Record<string, AppointmentData['status']> = {
    PENDIENTE: 'pending', CONFIRMADA: 'confirmed',
    COMPLETADA: 'completed', CANCELADA: 'cancelled',
  };
  return {
    id: String(a.id),
    patientId: a.patientId ?? 0,
    patientName: a.patientName ?? '',
    patientEmail: a.patientEmail ?? '',
    service: a.serviceName ?? '',
    date: a.appointmentDate ?? '',
    time: a.appointmentTime ?? '',
    status: statusMap[a.status] ?? 'pending',
    notes: a.notes ?? undefined,
  };
}

function appointmentStatusToApi(status: AppointmentData['status']): string {
  const map: Record<string, string> = {
    pending: 'PENDIENTE', confirmed: 'CONFIRMADA',
    completed: 'COMPLETADA', cancelled: 'CANCELADA',
  };
  return map[status] ?? 'PENDIENTE';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function specialistFromApi(s: any): SpecialistData {
  const creds = (s.registrationNumber ?? '').split('|');
  return {
    name: s.name ?? '',
    badge: s.badge ?? '',
    specialty: s.specialty ?? '',
    university: s.university ?? '',
    bio: s.bio ?? '',
    credential1: creds[0] ?? '',
    credential2: creds[1] ?? '',
    photoBase64: s.photoUrl ?? undefined,
  };
}

const SPECIALIST_FALLBACK: SpecialistData = {
  name: 'Dra. Angélica Camacho',
  badge: 'Especialista Líder',
  specialty: 'Terapias Alternativas y Farmacología Vegetal',
  university: 'Universidad Juan N Corpas',
  bio: 'Egresada de la prestigiosa Universidad Juan N Corpas, la Dra. Camacho integra la sabiduría de la medicina tradicional con el rigor científico moderno.',
  credential1: 'Certificación Médica',
  credential2: 'Especialista Corpas',
};

// ── Mappers usuarios backend ↔ frontend ───────────────────────────────────────

const ROLE_FROM_API: Record<string, UserData['role']> = {
  USER: 'PATIENT', THERAPIST: 'EDITOR', ADMIN: 'ADMIN',
  PATIENT: 'PATIENT', EDITOR: 'EDITOR',
};
const ROLE_TO_API: Record<UserData['role'], string> = {
  PATIENT: 'USER', EDITOR: 'THERAPIST', ADMIN: 'ADMIN',
};
const STATUS_FROM_API: Record<string, UserData['status']> = {
  ACTIVO: 'ACTIVE', INACTIVO: 'INACTIVE', INABILITADO: 'INACTIVE', ATENDIDO: 'INACTIVE',
  ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE',
};
const STATUS_TO_API: Record<UserData['status'], string> = {
  ACTIVE: 'ACTIVO', INACTIVE: 'INACTIVO',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function userFromApi(u: any): UserData {
  return {
    id: u.id,
    name: u.name ?? '',
    email: u.email ?? '',
    role: ROLE_FROM_API[u.role] ?? 'PATIENT',
    status: STATUS_FROM_API[u.status] ?? 'ACTIVE',
    joinedAt: u.createdAt ? u.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
  };
}

// ── Mappers planes de terapia backend ↔ frontend ──────────────────────────────

const PLAN_STATUS_FROM_API: Record<string, TherapyPlanData['status']> = {
  ACTIVO: 'active', PAUSADO: 'paused', COMPLETADO: 'completed', CANCELADO: 'cancelled',
};
const PLAN_STATUS_TO_API: Record<TherapyPlanData['status'], string> = {
  active: 'ACTIVO', paused: 'PAUSADO', completed: 'COMPLETADO', cancelled: 'CANCELADO',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function therapyPlanFromApi(p: any): TherapyPlanData {
  return {
    id: String(p.id),
    patientId: p.patientId ?? 0,
    patientName: p.patientName ?? '',
    patientEmail: p.patientEmail ?? '',
    service: p.serviceName ?? '',
    sessionsTotal: p.totalSessions ?? 0,
    sessionsCompleted: p.completedSessions ?? 0,
    startDate: p.startDate ?? '',
    status: PLAN_STATUS_FROM_API[p.status] ?? 'active',
    notes: p.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function therapyPlanToApi(data: Partial<TherapyPlanData> & { patientId?: number; patientName?: string; patientEmail?: string; service?: string; sessionsTotal?: number; startDate?: string }) {
  return {
    patientId: data.patientId,
    patientName: data.patientName,
    patientEmail: data.patientEmail,
    serviceName: data.service,
    totalSessions: data.sessionsTotal,
    completedSessions: data.sessionsCompleted ?? 0,
    startDate: data.startDate,
    status: data.status ? PLAN_STATUS_TO_API[data.status] : undefined,
    notes: data.notes,
  };
}

// ── Mappers historia clínica backend ↔ frontend ───────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function healthRecordFromApi(r: any): HealthRecordData {
  return {
    id: String(r.id),
    patientId: r.patientId ?? 0,
    patientName: r.patientName ?? '',
    appointmentId: r.appointmentId ?? null,
    specialistId: r.specialistId ?? null,
    reasonForConsultation: r.reasonForConsultation ?? '',
    currentIllness: r.currentIllness ?? undefined,
    physicalExam: r.physicalExam ?? undefined,
    diagnosis: r.diagnosis ?? '',
    treatmentPlan: r.treatmentPlan ?? undefined,
    observations: r.observations ?? undefined,
    nextAppointment: r.nextAppointment ?? undefined,
    locked: r.locked ?? false,
    hashIntegrity: r.hashIntegrity ?? undefined,
    createdBy: r.createdBy ?? null,
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? undefined,
  };
}

function healthRecordToApi(d: Partial<HealthRecordData> & { patientId?: number; reasonForConsultation?: string; diagnosis?: string }) {
  return {
    patientId: d.patientId,
    appointmentId: d.appointmentId ?? null,
    specialistId: d.specialistId ?? null,
    reasonForConsultation: d.reasonForConsultation,
    currentIllness: d.currentIllness,
    physicalExam: d.physicalExam,
    diagnosis: d.diagnosis,
    treatmentPlan: d.treatmentPlan,
    observations: d.observations,
    nextAppointment: d.nextAppointment ?? null,
    createdBy: d.createdBy ?? null,
  };
}

// ── Media mapper ──────────────────────────────────────────────────────────────

function mediaFromApi(d: any): MediaItem {
  return {
    id: d.id,
    name: d.name,
    url: d.url,
    mimeType: d.mimeType,
    size: d.size,
    uploadedAt: d.uploadedAt,
  };
}

// ── Context value type ────────────────────────────────────────────────────────

interface AdminDataContextValue {
  services: ServiceData[];
  updateService: (id: string, patch: Partial<ServiceData>) => Promise<void>;

  posts: PostData[];
  createPost: (post: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PostData>;
  updatePost: (id: string, patch: Partial<PostData>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  media: MediaItem[];
  addMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;

  users: UserData[];
  addUser: (data: { name: string; email: string; role: UserData['role']; password: string }) => Promise<UserData>;
  updateUserRole: (id: number, role: UserData['role']) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;

  specialist: SpecialistData;
  updateSpecialist: (patch: Partial<SpecialistData>) => Promise<void>;

  appointments: AppointmentData[];
  addAppointment: (data: Omit<AppointmentData, 'id'>) => Promise<AppointmentData>;
  updateAppointment: (id: string, patch: Partial<AppointmentData>) => Promise<void>;

  therapyPlans: TherapyPlanData[];
  addTherapyPlan: (data: Omit<TherapyPlanData, 'id'>) => Promise<TherapyPlanData>;
  updateTherapyPlan: (id: string, patch: Partial<TherapyPlanData>) => Promise<void>;
  deleteTherapyPlan: (id: string) => Promise<void>;

  healthRecords: HealthRecordData[];
  addHealthRecord: (data: Omit<HealthRecordData, 'id' | 'locked' | 'createdAt' | 'updatedAt' | 'hashIntegrity'>) => Promise<HealthRecordData>;
  updateHealthRecord: (id: string, patch: Partial<HealthRecordData>) => Promise<HealthRecordData>;
  lockHealthRecord: (id: string) => Promise<HealthRecordData>;
  deleteHealthRecord: (id: string) => Promise<void>;

  getUnreadCount: (userId: number) => number;
  markAllRead: (userId: number) => void;

  loading: boolean;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [specialist, setSpecialist] = useState<SpecialistData>(SPECIALIST_FALLBACK);
  const [users, setUsers] = useState<UserData[]>([]);
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlanData[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecordData[]>([]);
  const [loading, setLoading] = useState(true);

  const [media, setMedia] = useState<MediaItem[]>([]);

  // ── Carga inicial desde API ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [svcRes, postRes, aptRes, specRes, usrRes, planRes, hrRes, mediaRes] = await Promise.allSettled([
          axiosClient.get('/services'),
          axiosClient.get('/posts'),
          axiosClient.get('/appointments'),
          axiosClient.get('/specialist'),
          axiosClient.get('/user'),
          axiosClient.get('/therapy-plans'),
          axiosClient.get('/health-records'),
          axiosClient.get('/media'),
        ]);

        if (svcRes.status === 'fulfilled') setServices(svcRes.value.data.map(serviceFromApi));
        if (postRes.status === 'fulfilled') setPosts(postRes.value.data.map(postFromApi));
        if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data.map(appointmentFromApi));
        if (specRes.status === 'fulfilled' && specRes.value.data) setSpecialist(specialistFromApi(specRes.value.data));
        if (usrRes.status === 'fulfilled') setUsers(usrRes.value.data.map(userFromApi));
        if (planRes.status === 'fulfilled') setTherapyPlans(planRes.value.data.map(therapyPlanFromApi));
        if (hrRes.status === 'fulfilled') setHealthRecords(hrRes.value.data.map(healthRecordFromApi));
        if (mediaRes.status === 'fulfilled') setMedia(mediaRes.value.data.map(mediaFromApi));
      } catch (e) {
        console.warn('[AdminDataContext] Error cargando datos desde API:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Services ─────────────────────────────────────────────────────────────────
  const updateService = useCallback(async (id: string, patch: Partial<ServiceData>) => {
    const { data } = await axiosClient.put(`/services/${id}`, serviceToApi(patch));
    setServices(prev => prev.map(s => s.id === id ? serviceFromApi(data) : s));
  }, []);

  // ── Posts ─────────────────────────────────────────────────────────────────────
  const createPost = useCallback(async (postData: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostData> => {
    const { data } = await axiosClient.post('/posts', postToApi(postData));
    const newPost = postFromApi(data);
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const updatePost = useCallback(async (id: string, patch: Partial<PostData>) => {
    const { data } = await axiosClient.put(`/posts/${id}`, postToApi(patch));
    setPosts(prev => prev.map(p => p.id === id ? postFromApi(data) : p));
  }, []);

  const deletePost = useCallback(async (id: string) => {
    await axiosClient.delete(`/posts/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Specialist ────────────────────────────────────────────────────────────────
  const updateSpecialist = useCallback(async (patch: Partial<SpecialistData>) => {
    const apiPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) apiPatch.name = patch.name;
    if (patch.badge !== undefined) apiPatch.badge = patch.badge;
    if (patch.specialty !== undefined) apiPatch.specialty = patch.specialty;
    if (patch.university !== undefined) apiPatch.university = patch.university;
    if (patch.bio !== undefined) apiPatch.bio = patch.bio;
    if (patch.photoBase64 !== undefined) apiPatch.photoUrl = patch.photoBase64;
    if (patch.credential1 !== undefined || patch.credential2 !== undefined) {
      const c1 = patch.credential1 ?? specialist.credential1;
      const c2 = patch.credential2 ?? specialist.credential2;
      apiPatch.registrationNumber = `${c1}|${c2}`;
    }
    const { data } = await axiosClient.put('/specialist', apiPatch);
    setSpecialist(specialistFromApi(data));
  }, [specialist]);

  // ── Appointments ──────────────────────────────────────────────────────────────
  const addAppointment = useCallback(async (apt: Omit<AppointmentData, 'id'>): Promise<AppointmentData> => {
    const payload = {
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientEmail: apt.patientEmail,
      serviceName: apt.service,
      appointmentDate: apt.date,
      appointmentTime: apt.time,
      status: appointmentStatusToApi(apt.status),
      notes: apt.notes,
    };
    const { data } = await axiosClient.post('/appointments', payload);
    const newApt = appointmentFromApi(data);
    setAppointments(prev => [newApt, ...prev]);
    return newApt;
  }, []);

  const updateAppointment = useCallback(async (id: string, patch: Partial<AppointmentData>) => {
    if (patch.status !== undefined) {
      const { data } = await axiosClient.patch(`/appointments/${id}/status`, {
        status: appointmentStatusToApi(patch.status),
        cancellationReason: patch.notes,
      });
      setAppointments(prev => prev.map(a => a.id === id ? appointmentFromApi(data) : a));
    }
  }, []);

  // ── Media (API) ───────────────────────────────────────────────────────────────
  const addMedia = useCallback(async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const item = mediaFromApi(data);
    setMedia(prev => [item, ...prev]);
    return item;
  }, []);

  const deleteMedia = useCallback(async (id: string): Promise<void> => {
    await axiosClient.delete(`/media/${id}`);
    setMedia(prev => prev.filter(m => m.id !== id));
  }, []);

  // ── Users (API) ───────────────────────────────────────────────────────────────
  const addUser = useCallback(async (d: { name: string; email: string; role: UserData['role']; password: string }): Promise<UserData> => {
    const { data } = await axiosClient.post('/user/register', {
      name: d.name,
      email: d.email,
      password: d.password,
      role: ROLE_TO_API[d.role],
      status: 'ACTIVO',
    });
    const u = userFromApi(data);
    setUsers(prev => [...prev, u]);
    return u;
  }, []);

  const updateUserRole = useCallback(async (id: number, role: UserData['role']) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const { data } = await axiosClient.put(`/user/${id}`, {
      name: user.name,
      email: user.email,
      role: ROLE_TO_API[role],
      status: STATUS_TO_API[user.status],
    });
    setUsers(prev => prev.map(u => u.id === id ? userFromApi(data) : u));
  }, [users]);

  const toggleUserStatus = useCallback(async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus: UserData['status'] = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const { data } = await axiosClient.put(`/user/${id}`, {
      name: user.name,
      email: user.email,
      role: ROLE_TO_API[user.role],
      status: STATUS_TO_API[newStatus],
    });
    setUsers(prev => prev.map(u => u.id === id ? userFromApi(data) : u));
  }, [users]);

  // ── Therapy Plans (API) ───────────────────────────────────────────────────────
  const addTherapyPlan = useCallback(async (d: Omit<TherapyPlanData, 'id'>): Promise<TherapyPlanData> => {
    const { data } = await axiosClient.post('/therapy-plans', therapyPlanToApi(d));
    const p = therapyPlanFromApi(data);
    setTherapyPlans(prev => [p, ...prev]);
    return p;
  }, []);

  const updateTherapyPlan = useCallback(async (id: string, patch: Partial<TherapyPlanData>) => {
    const existing = therapyPlans.find(p => p.id === id);
    if (!existing) return;
    const merged = { ...existing, ...patch };
    const { data } = await axiosClient.put(`/therapy-plans/${id}`, therapyPlanToApi(merged));
    setTherapyPlans(prev => prev.map(p => p.id === id ? therapyPlanFromApi(data) : p));
  }, [therapyPlans]);

  const deleteTherapyPlan = useCallback(async (id: string) => {
    await axiosClient.delete(`/therapy-plans/${id}`);
    setTherapyPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Health Records (API) ──────────────────────────────────────────────────────
  const addHealthRecord = useCallback(async (
    d: Omit<HealthRecordData, 'id' | 'locked' | 'createdAt' | 'updatedAt' | 'hashIntegrity'>,
  ): Promise<HealthRecordData> => {
    const { data } = await axiosClient.post('/health-records', healthRecordToApi(d));
    const rec = healthRecordFromApi(data);
    setHealthRecords(prev => [rec, ...prev]);
    return rec;
  }, []);

  const updateHealthRecord = useCallback(async (id: string, patch: Partial<HealthRecordData>): Promise<HealthRecordData> => {
    const existing = healthRecords.find(r => r.id === id);
    if (!existing) throw new Error('Historia no encontrada');
    const merged = { ...existing, ...patch };
    const { data } = await axiosClient.put(`/health-records/${id}`, healthRecordToApi(merged));
    const updated = healthRecordFromApi(data);
    setHealthRecords(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, [healthRecords]);

  const lockHealthRecord = useCallback(async (id: string): Promise<HealthRecordData> => {
    const { data } = await axiosClient.patch(`/health-records/${id}/lock`);
    const locked = healthRecordFromApi(data);
    setHealthRecords(prev => prev.map(r => r.id === id ? locked : r));
    return locked;
  }, []);

  const deleteHealthRecord = useCallback(async (id: string): Promise<void> => {
    await axiosClient.delete(`/health-records/${id}`);
    setHealthRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────────
  const getUnreadCount = useCallback((userId: number): number => {
    const lastVisit = localStorage.getItem(`eco_pub_visit_${userId}`) ?? '1970-01-01';
    return posts.filter(p => p.status === 'published' && p.publishedAt && p.publishedAt > lastVisit).length;
  }, [posts]);

  const markAllRead = useCallback((userId: number) => {
    localStorage.setItem(`eco_pub_visit_${userId}`, new Date().toISOString());
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        services, updateService,
        posts, createPost, updatePost, deletePost,
        media, addMedia, deleteMedia,
        users, addUser, updateUserRole, toggleUserStatus,
        specialist, updateSpecialist,
        appointments, addAppointment, updateAppointment,
        therapyPlans, addTherapyPlan, updateTherapyPlan, deleteTherapyPlan,
        healthRecords, addHealthRecord, updateHealthRecord, lockHealthRecord, deleteHealthRecord,
        getUnreadCount, markAllRead,
        loading,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}
