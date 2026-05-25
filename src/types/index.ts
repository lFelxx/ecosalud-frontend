export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'PATIENT' | 'ADMIN' | 'THERAPIST';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  serviceId: number;
  therapistId?: number;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
