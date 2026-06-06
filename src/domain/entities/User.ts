export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'PATIENT' | 'ADMIN' | 'THERAPIST' | 'EDITOR';
  status: 'ACTIVE' | 'INACTIVE';
  tenantSchema?: string | null;
}
