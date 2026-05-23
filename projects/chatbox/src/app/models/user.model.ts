export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  createdAt: Date | string;
}

export interface Entrepreneur extends User {
  companyName: string;
  businessType: string;
}

export interface Admin extends User { }

export interface AuthResponse {
  user: User;
  token: string;
}

