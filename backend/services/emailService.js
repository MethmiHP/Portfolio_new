import dns from 'dns/promises';
import nodemailer from 'nodemailer';

const contactEmail = 'meth.pathirana@gmail.com';

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
      <td style="padding:12px 14px;border-bottom:1px solid #e5d9f5;color:#716184;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;width:34%">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 14px;border-bottom:1px solid #e5d9f5;color:#2e1065;font-size:14px;line-height:1.55">
        ${escapeHtml(value || 'Not provided')}
      </td>
    </tr>
  `).join('');
}

function brandedEmail({ preheader, eyebrow, title, intro, children, cta, footerNote }) {
  const safePreheader = escapeHtml(preheader || title || 'Methmi Pathirana Portfolio');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f7f3ff;font-family:Arial,Helvetica,sans-serif;color:#2e1065">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0">
          ${safePreheader}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ff;padding:28px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #e5d9f5;border-collapse:separate">
                <tr>
                  <td style="padding:24px 26px;border-bottom:1px solid #e5d9f5;background:#f7f3ff">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#2e1065;line-height:1">
                            Methmi Pathirana
                          </div>
                          <div style="margin-top:10px;color:#716184;font-size:10px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase">
                            Full-Stack Developer
                          </div>
                        </td>
                        <td align="right" style="color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase">
                          Portfolio
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px 26px 12px">
                    ${eyebrow ? `<div style="color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">${escapeHtml(eyebrow)}</div>` : ''}
                    <h1 style="margin:0;color:#2e1065;font-size:32px;line-height:1.05;letter-spacing:.5px;text-transform:uppercase">
                      ${escapeHtml(title)}
                    </h1>
                    ${intro ? `<p style="margin:18px 0 0;color:#59466f;font-size:15px;line-height:1.75">${intro}</p>` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 26px 28px">
                    ${children}
                    ${cta ? `
                      <div style="margin-top:24px">
                        <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 18px;font-size:12px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase">
                          ${escapeHtml(cta.label)}
                        </a>
                      </div>
                    ` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 26px;border-top:1px solid #e5d9f5;background:#faf8ff">
                    <p style="margin:0;color:#59466f;font-size:13px;line-height:1.7">
                      Best regards,<br>
                      <strong style="color:#2e1065">Methmi Pathirana</strong><br>
                      Full-Stack Developer<br>
                      <a href="mailto:${escapeHtml(contactEmail)}" style="color:#7c3aed;text-decoration:none">${escapeHtml(contactEmail)}</a>
                    </p>
                    ${footerNote ? `<p style="margin:16px 0 0;color:#716184;font-size:11px;line-height:1.6">${footerNote}</p>` : ''}
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
        from: `"Methmi Pathirana Portfolio" <${process.env.MAIL_USER}>`,
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5d9f5;background:#f7f3ff;border-collapse:collapse">
          ${detailRows([
            ['Client', project.clientName],
            ['Email', project.email],
            ['Project', project.projectTitle],
            ['Budget', project.budget || 'Not provided'],
            ['Timeline', project.timeline || 'Not provided'],
          ])}
        </table>
        <div style="margin-top:18px;padding:18px;border:1px solid #e5d9f5;background:#faf8ff">
          <div style="color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:10px">Project Details</div>
          <p style="margin:0;color:#2e1065;font-size:14px;line-height:1.75">${nl2br(project.description)}</p>
        </div>
      `,
      footerNote: 'This email was generated automatically by the Methmi Pathirana portfolio admin system.',
    }),
  });
}

export async function sendProjectReceivedEmail(project) {
  return sendMail({
    to: project.email,
    replyTo: contactEmail,
    subject: `Project Request Received - ${project.projectTitle}`,
    html: brandedEmail({
      preheader: `I received your project request: ${project.projectTitle}`,
      eyebrow: 'Request Received',
      title: 'Thank You for Your Project Request',
      intro: `Hello ${escapeHtml(project.clientName)}, Thank you for reaching out about <strong style="color:#2e1065">${escapeHtml(project.projectTitle)}</strong>.`,
      children: `
        <div style="padding:18px;border:1px solid #e5d9f5;background:#f7f3ff">
          <p style="margin:0;color:#59466f;font-size:14px;line-height:1.75">
            I have received your project request and will review your requirements, budget, and preferred timeline. I will get back to you soon to discuss the scope and next steps.
          </p>
          <p style="margin:14px 0 0;color:#59466f;font-size:14px;line-height:1.75">
            Once we confirm the project details, I will send your client portal login details to this email address so you can follow your project’s progress.
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
    replyTo: contactEmail,
    subject: `Your Client Portal Access - ${project.projectTitle}`,
    html: brandedEmail({
      preheader: `Client portal access for ${project.projectTitle}`,
      eyebrow: 'Private Client Portal',
      title: 'Your Project Portal Is Ready',
      intro: `Hello ${escapeHtml(project.clientName)}, your private project portal for <strong style="color:#2e1065">${escapeHtml(project.projectTitle)}</strong> has been created.`,
      children: `
        <div style="padding:18px;border:1px solid #7c3aed;background:#f3edff;margin-top:4px">
          <div style="color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;margin-bottom:12px">Login Credentials</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            ${detailRows([
              ['Username', project.username],
              ['Temporary Password', temporaryPassword],
            ])}
          </table>
        </div>
        <p style="margin:18px 0 0;color:#59466f;font-size:14px;line-height:1.75">
          You can use the portal to track project progress, review live updates, and follow important feedback throughout development.
        </p>
        <p style="margin:12px 0 0;color:#59466f;font-size:14px;line-height:1.75">
          For security, please change your temporary password after your first login.
        </p>
      `,
      cta: { href: portalUrl, label: 'Open Client Portal' },
      footerNote: `This email was also copied to ${escapeHtml(adminCopyEmail)} for your project records.`,
    }),
  });
}





