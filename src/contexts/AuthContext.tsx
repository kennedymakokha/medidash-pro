import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/hospital';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'admin@hospital.com',
    role: 'admin',
    department: 'Administration',
  },
  doctor: {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'doctor@hospital.com',
    role: 'doctor',
    department: 'Cardiology',
  },
  nurse: {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'nurse@hospital.com',
    role: 'nurse',
    department: 'ICU',
  },
  receptionist: {
    id: '4',
    name: 'James Wilson',
    email: 'reception@hospital.com',
    role: 'receptionist',
    department: 'Front Desk',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (password.length >= 4) {
      setUser(mockUsers[role]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
