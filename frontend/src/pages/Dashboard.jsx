import { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegularDashboard from './RegularDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Show different dashboard based on user role
  if (user?.subdomain === 'system') {
    return <SuperAdminDashboard />;
  }

  // Regular users and tenant admins see regular dashboard
  return <RegularDashboard />;
};

export default Dashboard;