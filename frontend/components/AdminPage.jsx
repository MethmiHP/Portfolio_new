import { useEffect, useState } from 'react';
import AdminLogin from './Admin/AdminLogin';
import AdminDashboard from './Admin/AdminDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener('admin-session-expired', handleExpired);
    return () => window.removeEventListener('admin-session-expired', handleExpired);
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    setSessionExpired(false);
  };

  return (
    <>
      {(!authenticated || sessionExpired) && (
        <AdminLogin
          onLogin={handleLogin}
          notice={sessionExpired ? 'Your session expired. Sign in to continue, then click Save again. Your unsaved edits are preserved.' : ''}
        />
      )}
      {authenticated && (
        <div hidden={sessionExpired}>
          <AdminDashboard onLogout={() => {
            setAuthenticated(false);
            setSessionExpired(false);
          }} />
        </div>
      )}
    </>
  );
}
