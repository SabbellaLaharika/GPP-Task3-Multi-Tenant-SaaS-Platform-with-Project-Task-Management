import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RoleGuard = ({ children, roles = [] }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return children;
};

export default RoleGuard;
