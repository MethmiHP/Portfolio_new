import dns from 'dns/promises';
import nodemailer from 'nodemailer';

const requiredMailVariables = ['MAIL_HOST', 'MAIL_USER', 'ADMIN_EMAIL'];

function getMailPassword() {
  return String(process.env.MAIL_APP_PASSWORD || process.env.MAIL_PASS || '').replace(/\s/g, '');
}

export function resolveMailConfig() {
  const password = getMailPassword();
  const isConfigured = requiredMailVariables.every((key) => process.env[key])
    && password
    && password !== 'YOUR_16_CHARACTER_GOOGLE_APP_PASSWORD'
    && !password.includes('YOUR_GOOGLE');

  return {
    isConfigured,
    password,
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: ['true', '1', 'yes'].includes(String(process.env.MAIL_SECURE || '').toLowerCase()),
    user: process.env.MAIL_USER,
    adminEmail: process.env.ADMIN_EMAIL,
  };
}

function createTransporter(mailConfig, override = {}) {
  const port = override.port || mailConfig.port;
  const secure = override.secure ?? mailConfig.secure;
  const host = override.host || mailConfig.host;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    family: 4,
    requireTLS: !secure,
    tls: { servername: mailConfig.host },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  });
}

async function resolveIpv4Host(host) {
  if (process.env.MAIL_FORCE_IPV4 === 'false') return host;

  try {
    const [address] = await dns.resolve4(host);
    return address || host;
  } catch {
    return host;
  }
}

async function getMailTransports() {
  const mailConfig = resolveMailConfig();
  if (!mailConfig.isConfigured) return [];
  const host = await resolveIpv4Host(mailConfig.host);
  const hostLabel = host !== mailConfig.host ? ` via ${host}` : '';

  const transports = [
    {
      label: `${mailConfig.host}:${mailConfig.port}${hostLabel}`,
      transporter: createTransporter(mailConfig, { host }),
    },
  ];

  if (mailConfig.host === 'smtp.gmail.com' && mailConfig.port !== 465) {
    transports.push({
      label: `${mailConfig.host}:465${hostLabel}`,
      transporter: createTransporter(mailConfig, { host, port: 465, secure: true }),
    });
  }

  return transports;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function nl2br(value = '') {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

function detailRows(rows) {
  return rows.map(([label, value]) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #242424;color:#8f8f8f;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;width:34%">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 14px;border-bottom:1px solid #242424;color:#f5f5f5;font-size:14px;line-height:1.55">
        ${escapeHtml(value || 'Not provided')}
      </td>
    </tr>
  `).join('');
}

function brandedEmail({ preheader, eyebrow, title, intro, children, cta, footerNote }) {
  const safePreheader = escapeHtml(preheader || title || 'Sandaru Kaushan Portfolio');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0">
          ${safePreheader}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:28px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#0b0b0b;border:1px solid #242424;border-collapse:separate">
                <tr>
                  <td style="padding:24px 26px;border-bottom:1px solid #242424;background:linear-gradient(135deg,#101010,#050505)">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#ffffff;line-height:1">
                            SK<span style="color:#cc0000">.</span>
                          </div>
                          <div style="margin-top:10px;color:#8f8f8f;font-size:10px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase">
                            Full-Stack / AI-ML Engineer
                          </div>
                        </td>
                        <td align="right" style="color:#cc0000;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase">
                          Portfolio System
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px 26px 12px">
                    ${eyebrow ? `<div style="color:#cc0000;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">${escapeHtml(eyebrow)}</div>` : ''}
                    <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.05;letter-spacing:.5px;text-transform:uppercase">
                      ${escapeHtml(title)}
                    </h1>
                    ${intro ? `<p style="margin:18px 0 0;color:#cfcfcf;font-size:15px;line-height:1.75">${intro}</p>` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 26px 28px">
                    ${children}
                    ${cta ? `
                      <div style="margin-top:24px">
                        <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#cc0000;color:#ffffff;text-decoration:none;padding:13px 18px;font-size:12px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase">
                          ${escapeHtml(cta.label)}
                        </a>
                      </div>
                    ` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 26px;border-top:1px solid #242424;background:#080808">
                    <p style="margin:0;color:#bdbdbd;font-size:13px;line-height:1.7">
                      Best regards,<br>
                      <strong style="color:#ffffff">Sandaru Kaushan</strong><br>
                      Full-Stack / AI-ML Engineer<br>
                      <a href="mailto:${escapeHtml(process.env.ADMIN_EMAIL || 'sandarukaushanwork@gmail.com')}" style="color:#cc0000;text-decoration:none">${escapeHtml(process.env.ADMIN_EMAIL || 'sandarukaushanwork@gmail.com')}</a>
                    </p>
                    ${footerNote ? `<p style="margin:16px 0 0;color:#777;font-size:11px;line-height:1.6">${footerNote}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function verifyEmailConnection() {
  const transports = await getMailTransports();
  if (!transports.length) {
    console.warn('Email service is not configured. Add MAIL_HOST, MAIL_USER, MAIL_APP_PASSWORD, and ADMIN_EMAIL to backend/.env');
    return false;
  }

  let lastError;
  for (const { label, transporter } of transports) {
    try {
      await transporter.verify();
      console.log(`Email server is ready via ${label}`);
      return true;
    } catch (err) {
      lastError = err;
      console.error(`Email server connection failed via ${label}:`, err.message);
      if (err.code) {
        console.error('SMTP error code:', err.code);
      }
      if (err.response) {
        console.error('SMTP response:', err.response);
      }
    }
  }

  console.error('All configured email transports failed:', lastError?.message || 'Unknown SMTP error');
  return false;
}

async function sendMail(message) {
  const transports = await getMailTransports();
  if (!transports.length) {
    throw new Error('Email service is not configured. Add mail settings to backend/.env');
  }

  let lastError;
  for (const { label, transporter } of transports) {
    try {
      return await transporter.sendMail({
        from: `"Sandaru Kaushan Portfolio" <${process.env.MAIL_USER}>`,
        ...message,
      });
    } catch (error) {
      lastError = error;
      console.error(`Email send failed via ${label}:`, error.message);
      if (error.code) {
        console.error('SMTP send error code:', error.code);
      }
      if (error.response) {
        console.error('SMTP send response:', error.response);
      }
    }
  }

  throw lastError;
}

export async function sendAdminProjectNotification(project) {
  return sendMail({
    to: process.env.ADMIN_EMAIL,
    replyTo: project.email,
    subject: `New Project Request: ${project.projectTitle}`,
    html: brandedEmail({
      preheader: `New project request from ${project.clientName}`,
      eyebrow: 'New Client Request',
      title: 'Project Handover Received',
      intro: `A customer submitted a new project request from your portfolio. You can review it in the admin panel and create private portal credentials when ready.`,
      children: `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #242424;background:#101010;border-collapse:collapse">
          ${detailRows([
            ['Client', project.clientName],
            ['Email', project.email],
            ['Project', project.projectTitle],
            ['Budget', project.budget || 'Not provided'],
            ['Timeline', project.timeline || 'Not provided'],
          ])}
        </table>
        <div style="margin-top:18px;padding:18px;border:1px solid #242424;background:#070707">
          <div style="color:#cc0000;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:10px">Project Details</div>
          <p style="margin:0;color:#f5f5f5;font-size:14px;line-height:1.75">${nl2br(project.description)}</p>
        </div>
      `,
      footerNote: 'This email was generated automatically by the Sandaru Kaushan portfolio admin system.',
    }),
  });
}

export async function sendProjectReceivedEmail(project) {
  return sendMail({
    to: project.email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Project Request Received - ${project.projectTitle}`,
    html: brandedEmail({
      preheader: `I received your project request: ${project.projectTitle}`,
      eyebrow: 'Request Received',
      title: 'Thank You for Your Project Request',
      intro: `Hello ${escapeHtml(project.clientName)}, I received your request for <strong style="color:#ffffff">${escapeHtml(project.projectTitle)}</strong>.`,
      children: `
        <div style="padding:18px;border:1px solid #242424;background:#101010">
          <p style="margin:0;color:#cfcfcf;font-size:14px;line-height:1.75">
            I will review your requirements, budget, and preferred timeline, then contact you to discuss scope, next steps, and the best way to bring your idea to life.
          </p>
          <p style="margin:14px 0 0;color:#cfcfcf;font-size:14px;line-height:1.75">
            Once your project is approved, your private client portal login details will be sent to this same email address.
          </p>
        </div>
      `,
      footerNote: 'If you need to add more details, reply directly to this email.',
    }),
  });
}

export async function sendClientPortalCredentials(project, temporaryPassword) {
  const portalBaseUrl = process.env.CLIENT_PORTAL_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const portalUrl = portalBaseUrl.endsWith('/client-login') ? portalBaseUrl : `${portalBaseUrl.replace(/\/$/, '')}/client-login`;
  const adminCopyEmail = process.env.CREDENTIALS_CC_EMAIL || process.env.ADMIN_EMAIL;

  return sendMail({
    to: project.email,
    cc: adminCopyEmail,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Your Client Portal Access - ${project.projectTitle}`,
    html: brandedEmail({
      preheader: `Client portal access for ${project.projectTitle}`,
      eyebrow: 'Private Client Portal',
      title: 'Your Project Portal Is Ready',
      intro: `Hello ${escapeHtml(project.clientName)}, your private project portal for <strong style="color:#ffffff">${escapeHtml(project.projectTitle)}</strong> has been created.`,
      children: `
        <div style="padding:18px;border:1px solid #cc0000;background:#160707;margin-top:4px">
          <div style="color:#cc0000;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:12px">Login Credentials</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            ${detailRows([
              ['Username', project.username],
              ['Temporary Password', temporaryPassword],
            ])}
          </table>
        </div>
        <p style="margin:18px 0 0;color:#cfcfcf;font-size:14px;line-height:1.75">
          You can use the portal to track project progress, review live updates, and follow important feedback throughout development.
        </p>
        <p style="margin:12px 0 0;color:#cfcfcf;font-size:14px;line-height:1.75">
          For security, please change your temporary password after your first login.
        </p>
      `,
      cta: { href: portalUrl, label: 'Open Client Portal' },
      footerNote: `This email was also copied to ${escapeHtml(adminCopyEmail)} for your project records.`,
    }),
  });
}





