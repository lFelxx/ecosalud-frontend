export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'PATIENT' | 'ADMIN' | 'THERAPIST';
  status: 'ACTIVE' | 'INACTIVE';
}
