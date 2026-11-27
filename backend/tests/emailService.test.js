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

 test('email templates use Methmi branding and escape customer content without sending email', async (t) => {
  const { default: nodemailer } = await import('nodemailer');
  const { sendProjectReceivedEmail, sendClientPortalCredentials, sendAdminProjectNotification } = await import('../services/emailService.js');
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async (message) => message }));
  const originalIpv4 = process.env.MAIL_FORCE_IPV4;
  process.env.MAIL_FORCE_IPV4 = 'false';
  t.after(() => {
    if (originalIpv4 === undefined) delete process.env.MAIL_FORCE_IPV4;
    else process.env.MAIL_FORCE_IPV4 = originalIpv4;
  });
  const project = {
    clientName: '<Client>', email: 'client@example.com', projectTitle: 'Web & Mobile',
    description: '<script>alert(1)</script>', username: 'client',
  };
  const received = await sendProjectReceivedEmail(project);
  const credentials = await sendClientPortalCredentials(project, 'test-password');
  const notification = await sendAdminProjectNotification(project);
  for (const message of [received, credentials, notification]) {
    assert.match(message.from, /Methmi Pathirana Portfolio/);
    assert.match(message.html, /Methmi Pathirana/);
    assert.match(message.html, /Full-Stack Developer/);
    assert.match(message.html, /mailto:meth\.pathirana@gmail\.com/);
    assert.match(message.html, /#7c3aed/);
    assert.doesNotMatch(message.html, /Sandaru|AI-ML|SK<span|#cc0000|<Client>|<script>/);
    assert.match(message.html, /&lt;Client&gt;/);
  }
  assert.equal(received.replyTo, 'meth.pathirana@gmail.com');
  assert.equal(credentials.replyTo, 'meth.pathirana@gmail.com');
  assert.equal(notification.replyTo, project.email);
  assert.match(received.html, /get back to you soon/);
  assert.match(credentials.html, /background:#7c3aed;color:#ffffff/);
});
