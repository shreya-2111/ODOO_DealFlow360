import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USER_ROLES[0]); // Alex Rivera (Sales Rep)
  const [tenant, setTenant] = useState('Global Enterprise Cloud Org');

  const switchRole = (roleId) => {
    const user = USER_ROLES.find(r => r.id === roleId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const isCustomer = currentUser.id === 'customer';
  const isManager = currentUser.id === 'sales_manager' || currentUser.id === 'admin';
  const isFinance = currentUser.id === 'finance_officer' || currentUser.id === 'admin';
  const isOps = currentUser.id === 'ops_lead' || currentUser.id === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      roles: USER_ROLES,
      tenant,
      setTenant,
      isCustomer,
      isManager,
      isFinance,
      isOps
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
