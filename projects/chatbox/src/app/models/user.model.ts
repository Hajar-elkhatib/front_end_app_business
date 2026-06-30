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

export interface LoginResponse {
  token: string;
  userId?: string;
  id?: string;
  role?: string;
  userRole?: string;
  roles?: string[] | string;
  fullName?: string;
  name?: string;
  email?: string;
  specialistId?: string;
  mongoId?: string;
  user?: Partial<User> & {
    userId?: string;
    role?: string;
    userRole?: string;
    roles?: string[] | string;
    specialistId?: string;
    mongoId?: string;
  };
}

