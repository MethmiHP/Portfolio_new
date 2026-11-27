import { ArrowRight, LockKeyhole, LogOut } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, clientApi } from '../src/api';
import { defaultPortfolio } from '../src/defaults';

export default function ClientPortal() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('clientToken'));
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(authenticated);
  const [settings, setSettings] = useState(defaultPortfolio.settings);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const copy = settings.clientPortal || {};

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientApi.getMyProject();
      setProject(data);
      setAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('clientToken');
      setAuthenticated(false);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getPortfolio()
      .then((portfolio) => setSettings({ ...defaultPortfolio.settings, ...(portfolio?.settings || {}) }))
      .catch(() => setSettings(defaultPortfolio.settings));
    if (authenticated) loadProject();
  }, [authenticated, loadProject]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const data = await clientApi.login(form.username, form.password);
      localStorage.setItem('clientToken', data.token);
      setProject(data.project);
      setAuthenticated(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('clientToken');
    setAuthenticated(false);
    setProject(null);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    try {
      const result = await clientApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setProject({ ...project, mustChangePassword: false });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMessage(result.message || 'Password changed successfully');
    } catch (err) {
      setPasswordMessage(err.message);
    }
  };

  if (!authenticated) {
    return (
      <main className="client-page">
        <form className="client-login-card" onSubmit={handleLogin}>
          <span className="qa-kicker"><LockKeyhole size={16} /> {copy.kicker || 'Client Portal'}</span>
          <h1>{copy.loginHeading || 'View Your Project Status'}</h1>
          <p>{copy.loginDescription || 'Use the private username and password I send after accepting your project.'}</p>
          <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Login'} <ArrowRight size={15} /></button>
          {message && <p className="admin-error">{message}</p>}
          <a href="/" className="back-link">← Back to Portfolio</a>
        </form>
      </main>
    );
  }

  if (loading || !project) return <div className="loading-screen">Loading project...</div>;

  return (
    <main className="client-page">
      <section className="client-status-card">
        <header className="client-status-head">
          <div>
            <span className="qa-kicker">{copy.statusKicker || 'Private Project Status'}</span>
            <h1>{project.projectTitle}</h1>
            <p>Client: {project.clientName}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={logout}><LogOut size={15} /> Logout</button>
        </header>

        <div className="client-progress-wrap">
          <div className="client-progress-meta">
            <span>{project.status}</span>
            <strong>{project.progress || 0}%</strong>
          </div>
          <div className="client-progress-track">
            <span style={{ width: `${project.progress || 0}%` }} />
          </div>
        </div>

        {project.mustChangePassword && (
          <form className="client-password-card" onSubmit={handleChangePassword}>
            <span>Security Required</span>
            <h2>Change Temporary Password</h2>
            <p>Please replace your temporary password before continuing to use the client portal.</p>
            <label>Current Password
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </label>
            <label>New Password
              <input type="password" minLength={8} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            </label>
            <button type="submit" className="btn-primary">Change Password</button>
            {passwordMessage && <p className="handover-message">{passwordMessage}</p>}
          </form>
        )}

        <div className="client-status-grid">
          <article>
            <span>Project Details</span>
            <p>{project.description}</p>
          </article>
          <article>
            <span>Latest Feedback</span>
            <p>{project.feedback || 'No feedback yet.'}</p>
          </article>
          <article>
            <span>Budget</span>
            <p>{project.budget || 'Not specified'}</p>
          </article>
          <article>
            <span>Timeline</span>
            <p>{project.timeline || 'Not specified'}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
