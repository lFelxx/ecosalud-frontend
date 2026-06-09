export interface Therapist {
  id: number;
  userId: number;
  specialty: string;
  biography?: string;
  yearsOfExperience?: number;
  available: boolean;
  userName: string;
  userEmail: string;
}
