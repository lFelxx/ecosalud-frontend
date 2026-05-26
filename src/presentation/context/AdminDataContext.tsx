import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

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
  base64: string;
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
  date: string;    // YYYY-MM-DD
  time: string;    // HH:MM
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
  startDate: string;   // YYYY-MM-DD
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
}

// ── Utilidad ID ───────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Datos iniciales ───────────────────────────────────────────────────────────

const INITIAL_SERVICES: ServiceData[] = [
  { id: 'acupuntura', name: 'Acupuntura', category: 'Dolor Crónico', description: 'Nuestra sesión de Acupuntura Integral combina técnicas ancestrales con un enfoque moderno para tratar el cuerpo de manera holística. Mediante la inserción precisa de agujas filiformes en puntos estratégicos, estimulamos el flujo de energía vital (Qi) para restaurar el equilibrio sistémico.', benefitsText: ['Alivio profundo del estrés y ansiedad', 'Equilibrio de los canales energéticos', 'Manejo efectivo del dolor crónico'], duration: '60 min', price: '$150.000 COP' },
  { id: 'oxivenaciones', name: 'Oxivenaciones', category: 'Energía', description: 'El tratamiento de Oxivenaciones incrementa la oxigenación celular para potenciar el metabolismo y la regeneración de tejidos. A través de la administración controlada de oxígeno puro, activamos los mecanismos naturales de energía y recuperación del organismo.', benefitsText: ['Aumento inmediato de energía y vitalidad', 'Mejora de la función respiratoria celular', 'Optimización del rendimiento físico y mental'], duration: '45 min', price: '$120.000 COP' },
  { id: 'sueroterapia-dirigida', name: 'Sueroterapia dirigida', category: 'Inmunidad', description: 'La Sueroterapia Dirigida administra cócteles personalizados de vitaminas, minerales y aminoácidos directamente en el torrente sanguíneo para una absorción del 100%. Cada fórmula es diseñada según las necesidades específicas del paciente.', benefitsText: ['Fortalecimiento inmediato del sistema inmune', 'Hidratación y nutrición celular profunda', 'Recuperación acelerada post-esfuerzo o enfermedad'], duration: '60 min', price: '$180.000 COP' },
  { id: 'ozonoterapia', name: 'Ozonoterapia', category: 'Desintoxicación', description: 'La Ozonoterapia utiliza las propiedades antiinflamatorias, antibacterianas y moduladoras del ozono médico para desintoxicar el organismo y activar sus defensas naturales. Es una terapia segura y con amplio respaldo científico internacional.', benefitsText: ['Potente efecto antiinflamatorio sistémico', 'Eliminación de patógenos y toxinas acumuladas', 'Modulación y fortalecimiento del sistema inmune'], duration: '60 min', price: '$160.000 COP' },
  { id: 'terapia-neural', name: 'Terapia Neural', category: 'Dolor Crónico', description: 'La Terapia Neural actúa sobre los campos de interferencia del sistema nervioso autónomo, repolarizando membranas celulares alteradas mediante microinyecciones de anestésico local. Ideal para tratar dolores crónicos, cicatrices y desequilibrios funcionales de larga data.', benefitsText: ['Eliminación de campos de interferencia neurales', 'Alivio duradero de dolores crónicos complejos', 'Restauración del equilibrio del sistema nervioso'], duration: '45 min', price: '$140.000 COP' },
  { id: 'biopuntura', name: 'Biopuntura', category: 'Desintoxicación', description: 'La Biopuntura combina la precisión de la acupuntura con el poder de los bioterápicos homeopáticos, inyectando microsoluciones en puntos específicos del cuerpo. Este enfoque activa los mecanismos de biorregulación propios del organismo para sanar desde adentro.', benefitsText: ['Activación de la capacidad de autocuración natural', 'Desintoxicación y biorregulación celular profunda', 'Sin efectos secundarios: 100% biológico'], duration: '30 min', price: '$130.000 COP' },
  { id: 'farmacologia-vegetal', name: 'Farmacología Vegetal', category: 'Inmunidad', description: 'La Farmacología Vegetal diseña fórmulas botánicas personalizadas basadas en la ciencia de las plantas medicinales. Combinamos extractos, tinturas y cápsulas de alta calidad para crear tratamientos integrales que potencian la inmunidad y el equilibrio hormonal.', benefitsText: ['Fórmulas 100% naturales y personalizadas', 'Fortalecimiento progresivo del sistema inmune', 'Respaldo en fitoquímica y etnobotánica médica'], duration: '60 min', price: '$100.000 COP' },
  { id: 'homeopatia', name: 'Homeopatía', category: 'Energía', description: 'La Homeopatía trabaja con diluciones ultra-moleculares de sustancias naturales para estimular la respuesta curativa del cuerpo. Nuestro enfoque restaura la vitalidad, el equilibrio emocional y la energía vital sin interferir con otros tratamientos médicos.', benefitsText: ['Restauración del equilibrio energético y emocional', 'Compatible con cualquier tratamiento médico', 'Tratamiento sin contraindicaciones ni toxicidad'], duration: '45 min', price: '$90.000 COP' },
];

const d = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

const INITIAL_POSTS: PostData[] = [
  { id: 'post-1', title: 'Los beneficios de la Ozonoterapia para la salud intestinal', excerpt: 'Descubre cómo el ozono médico transforma la salud del sistema digestivo y refuerza las defensas naturales del organismo de forma progresiva y segura.', content: 'La Ozonoterapia es una de las terapias más versátiles de la medicina biológica moderna. En el contexto de la salud intestinal, el ozono actúa como un potente modulador del microbioma, favoreciendo el equilibrio entre las bacterias benéficas y los patógenos.\n\n¿Cómo funciona?\n\nEl ozono médico se administra en diferentes formas según el caso clínico: rectal, intravenosa o tópica. En todos los casos, su mecanismo de acción central es la modulación del sistema inmune y la mejora de la oxigenación tisular.\n\nBeneficios documentados:\n\n• Reducción de la inflamación intestinal crónica\n• Eliminación de parásitos, bacterias y hongos resistentes\n• Mejora de la permeabilidad intestinal\n• Aumento de la absorción de nutrientes\n• Regulación del tránsito intestinal\n\nEn Ecosalud Market, cada protocolo de Ozonoterapia es diseñado individualmente por la Dra. Angélica Camacho, considerando el historial clínico y los objetivos de salud de cada paciente.\n\nResultados esperados\n\nLa mayoría de los pacientes reportan mejoría significativa después de 4 a 6 sesiones. El tratamiento completo suele comprender entre 10 y 20 aplicaciones dependiendo del diagnóstico.', status: 'published', tags: ['Ozonoterapia', 'Salud Intestinal', 'Bienestar'], authorId: 2, authorName: 'Dra. Angélica Camacho', createdAt: d(10), updatedAt: d(8), publishedAt: d(8) },
  { id: 'post-2', title: 'Guía de nutrición integrativa: Sueroterapia y vitalidad', excerpt: 'Los sueros vitamínicos intravenosos son una de las herramientas más potentes para restaurar la energía celular y fortalecer el sistema inmunológico en tiempo récord.', content: 'La Sueroterapia Dirigida representa un salto cualitativo frente a la suplementación oral tradicional. Al administrar micronutrientes directamente en el torrente sanguíneo, garantizamos una biodisponibilidad del 100%, algo imposible de lograr por vía digestiva.\n\n¿Qué contienen nuestros sueros?\n\nCada fórmula es personalizada, pero los componentes más frecuentes incluyen:\n\n• Vitamina C en altas dosis (efecto inmunoestimulante y antioxidante)\n• Complejo B (energía celular y función neurológica)\n• Magnesio (relajación muscular y función cardíaca)\n• Zinc (inmunidad y cicatrización)\n• Glutatión (el antioxidante maestro del organismo)\n• Aminoácidos esenciales\n\n¿Para quién está indicada?\n\nLa Sueroterapia es ideal para personas con fatiga crónica, estrés elevado, recuperación post-viral, deportistas de alto rendimiento y quienes buscan optimizar su salud de forma preventiva.\n\nSesión típica\n\nCada sesión dura entre 45 y 60 minutos. Se realiza en un ambiente tranquilo y controlado, con seguimiento médico permanente. La frecuencia varía entre semanal y mensual según el objetivo terapéutico.', status: 'published', tags: ['Sueroterapia', 'Vitaminas', 'Energía', 'Inmunidad'], authorId: 2, authorName: 'Dra. Angélica Camacho', createdAt: d(5), updatedAt: d(4), publishedAt: d(4) },
  { id: 'post-3', title: '¿Qué es la Biopuntura y cómo puede transformar tu salud?', excerpt: 'Una terapia innovadora que une la sabiduría ancestral de la acupuntura con la precisión de los bioterápicos modernos para activar los mecanismos de autocuración del cuerpo.', content: 'La Biopuntura es una disciplina terapéutica desarrollada en Europa que combina dos poderosas herramientas: la acupuntura tradicional y los bioterápicos homeopáticos inyectables.\n\nA diferencia de la acupuntura clásica, que utiliza agujas secas, la Biopuntura introduce micro-dosis de sustancias biológicas en puntos específicos del organismo. Estas sustancias actúan como mensajes terapéuticos que el cuerpo interpreta y utiliza para iniciar su proceso natural de curación.\n\nCondiciones que trata:\n\n• Dolores musculares y articulares crónicos\n• Lesiones deportivas y tendinitis\n• Procesos inflamatorios de repetición\n• Desintoxicación hepática y renal\n• Alergias y condiciones autoinmunes\n• Cicatrices problemáticas\n\nVentajas sobre otros tratamientos:\n\nAl trabajar con sustancias 100% biológicas en dosis mínimas, la Biopuntura no produce efectos secundarios y es perfectamente compatible con cualquier tratamiento médico convencional.\n\nProtocolo estándar\n\nUn protocolo básico consta de 6 a 10 sesiones de 30 minutos cada una, con frecuencia semanal o bisemanal.', status: 'published', tags: ['Biopuntura', 'Terapia Natural', 'Dolor'], authorId: 3, authorName: 'Editor Ecosalud', createdAt: d(2), updatedAt: d(1), publishedAt: d(1) },
  { id: 'post-4', title: '🌿 Promoción especial: Paquete Bienestar Integral', excerpt: 'Durante este mes, accede a nuestro paquete de 3 terapias con un descuento exclusivo para pacientes nuevos y existentes. Cupos limitados.', content: 'Queremos que más personas puedan experimentar la transformación que brinda la medicina integrativa. Por eso, durante este mes hemos diseñado un paquete especial que combina tres de nuestras terapias más populares a un precio accesible.\n\n¿Qué incluye el Paquete Bienestar Integral?\n\n✅ 1 sesión de Sueroterapia personalizada\n✅ 2 sesiones de Ozonoterapia\n✅ 1 consulta de seguimiento con la Dra. Angélica Camacho\n\nValor regular: $490.000 COP\nValor del paquete: $350.000 COP\n\n¡Ahorra $140.000 COP!\n\nCondiciones:\n\n• Válido para pacientes nuevos y existentes\n• Debe agendarse antes del último día del mes\n• Las sesiones deben completarse en un período máximo de 45 días\n• Cupos disponibles: 15\n\n¿Cómo reservar?\n\nHaz clic en "Agendar ahora" en cualquier terapia de nuestro catálogo, o escríbenos directamente para coordinar tu paquete personalizado.\n\n¡Tu bienestar no puede esperar!', status: 'draft', tags: ['Promoción', 'Oferta', 'Bienestar'], authorId: 2, authorName: 'Dra. Angélica Camacho', createdAt: d(1), updatedAt: d(0) },
];

const INITIAL_SPECIALIST: SpecialistData = {
  name: 'Dra. Angélica Camacho',
  badge: 'Especialista Líder',
  specialty: 'Medicina Alternativa y Farmacología Vegetal',
  university: 'Universidad Juan N Corpas',
  bio: 'Egresada de la prestigiosa Universidad Juan N Corpas, la Dra. Camacho integra la sabiduría de la medicina tradicional con el rigor científico moderno. Con más de una década de experiencia, se dedica a proporcionar alternativas terapéuticas que honran la fisiología natural del cuerpo.',
  credential1: 'Certificación Médica',
  credential2: 'Especialista Corpas',
};

const today = new Date();
const fd = (daysOffset: number, h: number, m: number): { date: string; time: string } => {
  const d = new Date(today);
  d.setDate(today.getDate() + daysOffset);
  return {
    date: d.toISOString().slice(0, 10),
    time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
};

const INITIAL_APPOINTMENTS: AppointmentData[] = [
  { id: 'apt-1', patientId: 4, patientName: 'María García', patientEmail: 'maria.garcia@gmail.com', service: 'Acupuntura', ...fd(0, 9, 0), status: 'confirmed' },
  { id: 'apt-2', patientId: 6, patientName: 'Laura Martínez', patientEmail: 'laura.m@gmail.com', service: 'Sueroterapia dirigida', ...fd(0, 10, 30), status: 'confirmed' },
  { id: 'apt-3', patientId: 7, patientName: 'Roberto Sánchez', patientEmail: 'r.sanchez@gmail.com', service: 'Ozonoterapia', ...fd(0, 12, 0), status: 'pending' },
  { id: 'apt-4', patientId: 1, patientName: 'Paciente Prueba', patientEmail: 'prueba@ecosalud.com', service: 'Biopuntura', ...fd(1, 9, 30), status: 'pending' },
  { id: 'apt-5', patientId: 4, patientName: 'María García', patientEmail: 'maria.garcia@gmail.com', service: 'Terapia Neural', ...fd(1, 11, 0), status: 'pending' },
  { id: 'apt-6', patientId: 6, patientName: 'Laura Martínez', patientEmail: 'laura.m@gmail.com', service: 'Homeopatía', ...fd(2, 10, 0), status: 'confirmed' },
  { id: 'apt-7', patientId: 7, patientName: 'Roberto Sánchez', patientEmail: 'r.sanchez@gmail.com', service: 'Oxivenaciones', ...fd(3, 14, 0), status: 'pending' },
  { id: 'apt-8', patientId: 1, patientName: 'Paciente Prueba', patientEmail: 'prueba@ecosalud.com', service: 'Farmacología Vegetal', ...fd(-1, 9, 0), status: 'completed' },
  { id: 'apt-9', patientId: 4, patientName: 'María García', patientEmail: 'maria.garcia@gmail.com', service: 'Acupuntura', ...fd(-2, 11, 0), status: 'completed' },
  { id: 'apt-10', patientId: 5, patientName: 'Carlos López', patientEmail: 'carlos.lopez@gmail.com', service: 'Ozonoterapia', ...fd(-3, 10, 0), status: 'cancelled', notes: 'Paciente canceló por enfermedad' },
];

const tp = (daysOffset: number) => {
  const d2 = new Date(today); d2.setDate(today.getDate() + daysOffset);
  return d2.toISOString().slice(0, 10);
};

const INITIAL_THERAPY_PLANS: TherapyPlanData[] = [
  { id: 'plan-1', patientId: 4, patientName: 'María García',    patientEmail: 'maria.garcia@gmail.com', service: 'Ozonoterapia',         sessionsTotal: 5,  sessionsCompleted: 3, startDate: tp(-24), status: 'active'    },
  { id: 'plan-2', patientId: 4, patientName: 'María García',    patientEmail: 'maria.garcia@gmail.com', service: 'Acupuntura',            sessionsTotal: 10, sessionsCompleted: 1, startDate: tp(-14), status: 'active'    },
  { id: 'plan-3', patientId: 1, patientName: 'Paciente Prueba', patientEmail: 'prueba@ecosalud.com',    service: 'Farmacología Vegetal',  sessionsTotal: 8,  sessionsCompleted: 8, startDate: tp(-90), status: 'completed' },
  { id: 'plan-4', patientId: 6, patientName: 'Laura Martínez',  patientEmail: 'laura.m@gmail.com',      service: 'Homeopatía',            sessionsTotal: 6,  sessionsCompleted: 6, startDate: tp(-80), status: 'completed' },
  { id: 'plan-5', patientId: 7, patientName: 'Roberto Sánchez', patientEmail: 'r.sanchez@gmail.com',   service: 'Sueroterapia dirigida', sessionsTotal: 4,  sessionsCompleted: 2, startDate: tp(-10), status: 'active'    },
];

const INITIAL_USERS: UserData[] = [
  { id: 2, name: 'Angélica Camacho', email: 'admin@ecosalud.com', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2025-06-01' },
  { id: 3, name: 'Editor Ecosalud', email: 'editor@ecosalud.com', role: 'EDITOR', status: 'ACTIVE', joinedAt: '2025-09-15' },
  { id: 1, name: 'Paciente Prueba', email: 'prueba@ecosalud.com', role: 'PATIENT', status: 'ACTIVE', joinedAt: '2026-01-15' },
  { id: 4, name: 'María García', email: 'maria.garcia@gmail.com', role: 'PATIENT', status: 'ACTIVE', joinedAt: '2026-02-10' },
  { id: 5, name: 'Carlos López', email: 'carlos.lopez@gmail.com', role: 'PATIENT', status: 'INACTIVE', joinedAt: '2025-11-20' },
  { id: 6, name: 'Laura Martínez', email: 'laura.m@gmail.com', role: 'PATIENT', status: 'ACTIVE', joinedAt: '2026-03-05' },
  { id: 7, name: 'Roberto Sánchez', email: 'r.sanchez@gmail.com', role: 'PATIENT', status: 'ACTIVE', joinedAt: '2026-04-18' },
];

// ── localStorage helpers ───────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AdminDataContextValue {
  // Services
  services: ServiceData[];
  updateService: (id: string, patch: Partial<ServiceData>) => void;

  // Posts
  posts: PostData[];
  createPost: (post: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>) => PostData;
  updatePost: (id: string, patch: Partial<PostData>) => void;
  deletePost: (id: string) => void;

  // Media
  media: MediaItem[];
  addMedia: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => MediaItem;
  deleteMedia: (id: string) => void;

  // Users
  users: UserData[];
  addUser: (data: { name: string; email: string; role: UserData['role'] }) => UserData;
  updateUserRole: (id: number, role: UserData['role']) => void;
  toggleUserStatus: (id: number) => void;

  // Specialist
  specialist: SpecialistData;
  updateSpecialist: (patch: Partial<SpecialistData>) => void;

  // Appointments
  appointments: AppointmentData[];
  addAppointment: (data: Omit<AppointmentData, 'id'>) => AppointmentData;
  updateAppointment: (id: string, patch: Partial<AppointmentData>) => void;

  // Therapy Plans
  therapyPlans: TherapyPlanData[];
  addTherapyPlan: (data: Omit<TherapyPlanData, 'id'>) => TherapyPlanData;
  updateTherapyPlan: (id: string, patch: Partial<TherapyPlanData>) => void;

  // Notifications
  getUnreadCount: (userId: number) => number;
  markAllRead: (userId: number) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceData[]>(() =>
    load('eco_services', INITIAL_SERVICES),
  );
  const [posts, setPosts] = useState<PostData[]>(() =>
    load('eco_posts', INITIAL_POSTS),
  );
  const [media, setMedia] = useState<MediaItem[]>(() =>
    load('eco_media', [] as MediaItem[]),
  );
  const [users, setUsers] = useState<UserData[]>(() =>
    load('eco_users', INITIAL_USERS),
  );
  const [specialist, setSpecialist] = useState<SpecialistData>(() =>
    load('eco_specialist', INITIAL_SPECIALIST),
  );
  const [appointments, setAppointments] = useState<AppointmentData[]>(() =>
    load('eco_appointments', INITIAL_APPOINTMENTS),
  );
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlanData[]>(() =>
    load('eco_therapy_plans', INITIAL_THERAPY_PLANS),
  );

  // Persist on every change
  const persist = useCallback((key: string, value: unknown) => save(key, value), []);

  // ── Services ────────────────────────────────────────────────────────────────
  const updateService = useCallback((id: string, patch: Partial<ServiceData>) => {
    setServices((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, ...patch } : s);
      persist('eco_services', next);
      return next;
    });
  }, [persist]);

  // ── Posts ───────────────────────────────────────────────────────────────────
  const createPost = useCallback((data: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>): PostData => {
    const now2 = new Date().toISOString();
    const post: PostData = { ...data, id: uid(), createdAt: now2, updatedAt: now2 };
    setPosts((prev) => {
      const next = [post, ...prev];
      persist('eco_posts', next);
      return next;
    });
    return post;
  }, [persist]);

  const updatePost = useCallback((id: string, patch: Partial<PostData>) => {
    setPosts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...patch, updatedAt: new Date().toISOString() };
        if (patch.status === 'published' && !p.publishedAt) {
          updated.publishedAt = updated.updatedAt;
        }
        return updated;
      });
      persist('eco_posts', next);
      return next;
    });
  }, [persist]);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist('eco_posts', next);
      return next;
    });
  }, [persist]);

  // ── Media ───────────────────────────────────────────────────────────────────
  const addMedia = useCallback((item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem => {
    const newItem: MediaItem = { ...item, id: uid(), uploadedAt: new Date().toISOString() };
    setMedia((prev) => {
      const next = [newItem, ...prev];
      persist('eco_media', next);
      return next;
    });
    return newItem;
  }, [persist]);

  const deleteMedia = useCallback((id: string) => {
    setMedia((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persist('eco_media', next);
      return next;
    });
  }, [persist]);

  // ── Users ───────────────────────────────────────────────────────────────────
  const addUser = useCallback((data: { name: string; email: string; role: UserData['role'] }): UserData => {
    const newUser: UserData = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
    };
    setUsers((prev) => {
      const next = [...prev, newUser];
      persist('eco_users', next);
      return next;
    });
    return newUser;
  }, [persist]);

  const updateUserRole = useCallback((id: number, role: UserData['role']) => {
    setUsers((prev) => {
      const next = prev.map((u) => u.id === id ? { ...u, role } : u);
      persist('eco_users', next);
      return next;
    });
  }, [persist]);

  const toggleUserStatus = useCallback((id: number) => {
    setUsers((prev) => {
      const next = prev.map((u) =>
        u.id === id ? { ...u, status: (u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE' } : u,
      );
      persist('eco_users', next);
      return next;
    });
  }, [persist]);

  // ── Specialist ──────────────────────────────────────────────────────────────
  const updateSpecialist = useCallback((patch: Partial<SpecialistData>) => {
    setSpecialist((prev) => {
      const next = { ...prev, ...patch };
      persist('eco_specialist', next);
      return next;
    });
  }, [persist]);

  // ── Appointments ─────────────────────────────────────────────────────────────
  const addAppointment = useCallback((data: Omit<AppointmentData, 'id'>): AppointmentData => {
    const newApt: AppointmentData = { ...data, id: `apt-${uid()}` };
    setAppointments((prev) => {
      const next = [newApt, ...prev];
      persist('eco_appointments', next);
      return next;
    });
    return newApt;
  }, [persist]);

  const updateAppointment = useCallback((id: string, patch: Partial<AppointmentData>) => {
    setAppointments((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, ...patch } : a);
      persist('eco_appointments', next);
      return next;
    });
  }, [persist]);

  // ── Therapy Plans ─────────────────────────────────────────────────────────────
  const addTherapyPlan = useCallback((data: Omit<TherapyPlanData, 'id'>): TherapyPlanData => {
    const plan: TherapyPlanData = { ...data, id: `plan-${uid()}` };
    setTherapyPlans((prev) => {
      const next = [plan, ...prev];
      persist('eco_therapy_plans', next);
      return next;
    });
    return plan;
  }, [persist]);

  const updateTherapyPlan = useCallback((id: string, patch: Partial<TherapyPlanData>) => {
    setTherapyPlans((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, ...patch } : p);
      persist('eco_therapy_plans', next);
      return next;
    });
  }, [persist]);

  // ── Notifications ────────────────────────────────────────────────────────────
  const getUnreadCount = useCallback((userId: number): number => {
    const lastVisit = localStorage.getItem(`eco_pub_visit_${userId}`) ?? '1970-01-01';
    return posts.filter(
      (p) => p.status === 'published' && p.publishedAt && p.publishedAt > lastVisit,
    ).length;
  }, [posts]);

  const markAllRead = useCallback((userId: number) => {
    localStorage.setItem(`eco_pub_visit_${userId}`, new Date().toISOString());
  }, []);

  return (
    <AdminDataContext.Provider
      value={{ services, updateService, posts, createPost, updatePost, deletePost, media, addMedia, deleteMedia, users, addUser, updateUserRole, toggleUserStatus, specialist, updateSpecialist, appointments, addAppointment, updateAppointment, therapyPlans, addTherapyPlan, updateTherapyPlan, getUnreadCount, markAllRead }}
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
