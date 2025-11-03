
import React, { createContext, useContext, useState, useMemo } from 'react';
import { User, Role } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

// Mock Users
const MOCK_USERS: User[] = [
  { id: 'teacher1', name: 'Dr. Evelyn Reed', role: Role.Teacher },
  { id: 'student1', name: 'Alex Johnson', role: Role.Student },
  { id: 'student2', name: 'Ben Carter', role: Role.Student },
];

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('quiz-user', null);
  const [user, setUser] = useState<User | null>(storedUser);

  const login = (userId: string) => {
    const foundUser = MOCK_USERS.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setStoredUser(foundUser);
    }
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  const value = useMemo(() => ({
    user,
    users: MOCK_USERS,
    login,
    logout,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
