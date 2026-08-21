import { useState } from 'react';
import AdminLogin from './Admin/AdminLogin';
import AdminDashboard from './Admin/AdminDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  return authenticated ? (
    <AdminDashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <AdminLogin onLogin={() => setAuthenticated(true)} />
  );
}
