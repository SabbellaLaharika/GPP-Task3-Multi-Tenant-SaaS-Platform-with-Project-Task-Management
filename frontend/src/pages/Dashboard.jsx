import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import TenantAdminDashboard from './TenantAdminDashboard';
import RegularUserDashboard from './RegularUserDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to different dashboards based on user role
  
  // Super Admin: System-wide view, no user management
  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  // Tenant Admin: Full control within their organization
  if (user?.role === 'tenant_admin') {
    return <TenantAdminDashboard />;
  }

  // Regular User: Only their tasks and profile
  return <RegularUserDashboard />;
};

export default Dashboard;