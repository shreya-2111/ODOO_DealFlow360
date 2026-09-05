import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USER_ROLES[0]); // Amit Sharma (Sales Rep)
  const [tenant, setTenant] = useState('DealFlow360 Enterprise India');

  const switchRole = (roleId) => {
    const user = USER_ROLES.find((r) => r.id === roleId);
    if (user) {
      setCurrentUser(user);
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
