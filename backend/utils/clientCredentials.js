import crypto from 'crypto';

export function createUsernameBase(clientName, email) {
  const source = clientName?.trim() || email?.split('@')[0] || `client${Date.now()}`;
  const cleaned = source.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24);
  return cleaned || `client${Date.now()}`;
}

export async function generateUniqueUsername(db, { clientName, email, projectId }) {
  const base = createUsernameBase(clientName, email);
  let username = base;
  let suffix = 1;

  while (await db.collection('clientProjects').findOne({
    username,
    ...(projectId ? { _id: { $ne: projectId } } : {}),
  })) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
}

export function generateTemporaryPassword() {
  return `${crypto.randomBytes(9).toString('base64url')}aA1!`;
}
