const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

function getClientToken() {
  return localStorage.getItem('clientToken');
}

function stripMongoFields(data) {
  if (!data || typeof data !== 'object' || data instanceof FormData) return data;

  const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...safeData } = data;
  return safeData;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getPortfolio: () => request('/portfolio'),
  updatePortfolio: (data) =>
    request('/portfolio', { method: 'PUT', body: JSON.stringify(stripMongoFields(data)) }),
  uploadPortfolioAsset: (formData) =>
    request('/portfolio/asset', { method: 'POST', body: formData }),
  deletePortfolio: (password) =>
    request('/portfolio', { method: 'DELETE', body: JSON.stringify({ password }) }),

  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (formData) =>
    request('/projects', { method: 'POST', body: formData }),
  updateProject: (id, formData) =>
    request(`/projects/${id}`, { method: 'PUT', body: formData }),
  reorderProjects: (orderedIds) =>
    request('/projects/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) }),
  renameProjectCategory: (from, to) =>
    request('/projects/categories/rename', { method: 'PUT', body: JSON.stringify({ from, to }) }),
  deleteProjectCategory: (category, moveTo = 'Development') =>
    request('/projects/categories/delete', { method: 'PUT', body: JSON.stringify({ category, moveTo }) }),
  deleteProject: (id) =>
    request(`/projects/${id}`, { method: 'DELETE' }),

  getPublicQuestions: ({ limit = 5, skip = 0 } = {}) =>
    request(`/qa?limit=${limit}&skip=${skip}`),
  askQuestion: (data) =>
    request('/qa', { method: 'POST', body: JSON.stringify(data) }),
  getAdminQuestions: () => request('/qa/admin'),
  answerQuestion: (id, answer) =>
    request(`/qa/${id}/answer`, { method: 'PUT', body: JSON.stringify({ answer }) }),
  deleteQuestion: (id) =>
    request(`/qa/${id}`, { method: 'DELETE' }),

  requestClientProject: (data) =>
    request('/client-projects/request', { method: 'POST', body: JSON.stringify(data) }),
  getClientProjectStatuses: () => request('/client-projects/statuses'),
  getAdminClientProjects: () => request('/client-projects/admin'),
  updateClientProject: (id, data) =>
    request(`/client-projects/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClientProject: (id) =>
    request(`/client-projects/admin/${id}`, { method: 'DELETE' }),
};

async function clientRequest(endpoint, options = {}) {
  const token = getClientToken();
  const headers = { ...options.headers, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const clientApi = {
  login: (username, password) =>
    clientRequest('/client-projects/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMyProject: () => clientRequest('/client-projects/me'),
  changePassword: (currentPassword, newPassword) =>
    clientRequest('/client-projects/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${path}`;
}
