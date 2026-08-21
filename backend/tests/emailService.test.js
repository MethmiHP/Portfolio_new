import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMailConfig } from '../services/emailService.js';

test('resolveMailConfig accepts Gmail app password from MAIL_PASS fallback', () => {
  process.env.MAIL_HOST = 'smtp.gmail.com';
  process.env.MAIL_USER = 'me@example.com';
  process.env.MAIL_APP_PASSWORD = '';
  process.env.MAIL_PASS = '1234567890abcdef';
  process.env.ADMIN_EMAIL = 'admin@example.com';

  const config = resolveMailConfig();

  assert.equal(config.password, '1234567890abcdef');
  assert.equal(config.isConfigured, true);
});
