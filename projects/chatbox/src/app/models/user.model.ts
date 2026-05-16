export interface User {
  id: string;
  email: string;
  role: 'entrepreneur' | 'specialist';
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
