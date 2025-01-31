export interface Profile {
  id: string;
  role: 'customer' | 'provider';
  full_name: string | null;
  phone: string | null;
  created_at: string;
}