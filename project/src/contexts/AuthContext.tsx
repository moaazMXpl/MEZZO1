import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isOperator: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOperator, setIsOperator] = useState(false);

  useEffect(() => {
    const operatorSession = localStorage.getItem('operator_session');
    if (operatorSession === 'active') {
      setIsOperator(true);
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (password === 'moaazMXpl011#') {
      setIsOperator(true);
      localStorage.setItem('operator_session', 'active');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsOperator(false);
    localStorage.removeItem('operator_session');
  };

  return (
    <AuthContext.Provider value={{ isOperator, login, logout }}>
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