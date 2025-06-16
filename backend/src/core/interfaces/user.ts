export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  password: string;
  country?: string;
  city?: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}
