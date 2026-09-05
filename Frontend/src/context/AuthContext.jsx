import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../data/mockData';

const AuthContext = createContext(null);

// Authentication context providing active user persona and permission helper flags
export function AuthProvider({ children }) {
  // Default to first persona: Amit Sharma (Sales Rep)
  const [currentUser, setCurrentUser] = useState(USER_ROLES[0]);
  const [tenant, setTenant] = useState('DealFlow360 Enterprise India');

  // Switch the active user role across the 5 supported personas
  const switchRole = (roleId) => {
    const user = USER_ROLES.find((r) => r.id === roleId);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Role verification helper flags
  const isSalesRep = currentUser.id === 'sales_rep';
  const isSalesManager = currentUser.id === 'sales_manager';
  const isFinanceOps = currentUser.id === 'finance_ops';
  const isCustomer = currentUser.id === 'customer';
  const isAdmin = currentUser.id === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        roles: USER_ROLES,
        tenant,
        setTenant,
        isSalesRep,
        isSalesManager,
        isFinanceOps,
        isCustomer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume user authentication and role state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
