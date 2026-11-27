import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  sendAdminProjectNotification,
  sendClientPortalCredentials,
  sendProjectReceivedEmail,
} from '../services/emailService.js';
import { generateTemporaryPassword, generateUniqueUsername } from '../utils/clientCredentials.js';
import { isStrongPassword, isValidEmail } from '../utils/validation.js';

const router = Router();

const STATUS_OPTIONS = ['Requested', 'Started', 'Developing', '10%', '50%', '80%', 'Finished'];

function cleanText(value, maxLength = 1000) {
  return String(value || '').trim().slice(0, maxLength);
}

function sanitizeProject(project) {
  if (!project) return project;
  const { password, ...safeProject } = project;
  return safeProject;
}

function normalizeUsername(value) {
  return cleanText(value, 100).toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function clientAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'client' || !payload.projectId) {
      return res.status(401).json({ message: 'Invalid client token' });
    }
    req.client = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/statuses', (_req, res) => {
  res.json(STATUS_OPTIONS);
});

router.post('/request', async (req, res) => {
  try {
    const clientName = cleanText(req.body.clientName, 100);
    const email = cleanText(req.body.email, 160);
    const projectTitle = cleanText(req.body.projectTitle, 160);
    const description = cleanText(req.body.description, 2500);
    const budget = cleanText(req.body.budget, 80);
    const timeline = cleanText(req.body.timeline, 120);

    if (!clientName || !email || !projectTitle || !description) {
      return res.status(400).json({ message: 'Name, email, project title, and description are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (clientName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (projectTitle.length < 3) {
      return res.status(400).json({ message: 'Project title must be at least 3 characters' });
    }
    if (description.length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters' });
    }

    const doc = {
      clientName,
      email,
      projectTitle,
      description,
      budget,
      timeline,
      username: '',
      password: '',
      mustChangePassword: false,
      credentialsSentAt: null,
      credentialEmailStatus: 'not-created',
      credentialEmailError: '',
      requestEmailStatus: 'pending',
      requestEmailError: '',
      status: 'Requested',
      progress: 0,
      feedback: 'Project request received. I will review it and contact you soon.',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = getDB();
    const result = await db.collection('clientProjects').insertOne(doc);
    const savedProject = { ...doc, _id: result.insertedId };

    const emailResults = await Promise.allSettled([
      sendAdminProjectNotification(savedProject),
      sendProjectReceivedEmail(savedProject),
    ]);
    const failedEmail = emailResults.find((item) => item.status === 'rejected');
    const emailError = failedEmail?.reason?.message || '';

    if (emailError) {
      console.error('Project request email delivery failed:', emailError);
    }

    await db.collection('clientProjects').updateOne(
      { _id: result.insertedId },
      {
        $set: {
          requestEmailStatus: failedEmail ? 'partial-or-failed' : 'sent',
          requestEmailError: emailError,
          updatedAt: new Date(),
        },
      }
    );

    res.status(201).json({
      ...sanitizeProject(savedProject),
      emailStatus: failedEmail ? 'partial-or-failed' : 'sent',
      emailError,
      message: failedEmail
        ? 'Project request saved successfully. Email notification could not be sent right now, so I will review it from the admin portal.'
        : 'Project request submitted successfully. Please check your email for confirmation.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT secret is not configured' });

    const db = getDB();
    const project = await db.collection('clientProjects').findOne({ username });
    if (!project?.password) return res.status(401).json({ message: 'Invalid client credentials' });

    const valid = await bcrypt.compare(password, project.password);
    if (!valid) return res.status(401).json({ message: 'Invalid client credentials' });

    const token = jwt.sign(
      { role: 'client', projectId: project._id.toString(), username },
      process.env.JWT_SECRET,
      { expiresIn: '1m' }
    );

    res.json({ token, project: sanitizeProject(project) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', clientAuth, async (req, res) => {
  try {
    const db = getDB();
    const project = await db.collection('clientProjects').findOne({ _id: new ObjectId(req.client.projectId) });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(sanitizeProject(project));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin', authMiddleware, async (_req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('clientProjects').find({}).sort({ updatedAt: -1 }).toArray();
    res.json(items.map(sanitizeProject));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/admin/:id', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid project id' });
    const projectId = new ObjectId(req.params.id);
    const db = getDB();
    const existing = await db.collection('clientProjects').findOne({ _id: projectId });
    if (!existing) return res.status(404).json({ message: 'Client project not found' });

    const update = {
      clientName: cleanText(req.body.clientName, 100),
      email: cleanText(req.body.email, 160),
      projectTitle: cleanText(req.body.projectTitle, 160),
      description: cleanText(req.body.description, 2500),
      budget: cleanText(req.body.budget, 80),
      timeline: cleanText(req.body.timeline, 120),
      username: normalizeUsername(req.body.username),
      status: STATUS_OPTIONS.includes(req.body.status) ? req.body.status : 'Requested',
      progress: Math.max(0, Math.min(100, Number(req.body.progress) || 0)),
      feedback: cleanText(req.body.feedback, 3000),
      notes: cleanText(req.body.notes, 3000),
      updatedAt: new Date(),
    };

    if (!update.clientName || !update.email || !update.projectTitle || !update.description) {
      return res.status(400).json({ message: 'Client name, email, project title, and description are required.' });
    }
    if (!isValidEmail(update.email)) {
      return res.status(400).json({ message: 'Enter a valid client email address.' });
    }

    if (update.username) {
      const usernameOwner = await db.collection('clientProjects').findOne({
        username: update.username,
        _id: { $ne: projectId },
      });
      if (usernameOwner) return res.status(409).json({ message: 'That client username is already being used.' });
    }

    const suppliedPassword = String(req.body.password || '').trim();
    const shouldCreateFirstCredentials = !existing.credentialsSentAt && !existing.password;
    let plainPassword = suppliedPassword;
    let shouldEmailCredentials = false;

    if (!update.username && shouldCreateFirstCredentials) {
      update.username = await generateUniqueUsername(db, {
        clientName: update.clientName,
        email: update.email,
        projectId,
      });
    }

    if (shouldCreateFirstCredentials || suppliedPassword) {
      if (!plainPassword) plainPassword = generateTemporaryPassword();
      if (!isStrongPassword(plainPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.' });
      }
      update.password = await bcrypt.hash(plainPassword, 12);
      update.mustChangePassword = true;
      update.credentialEmailStatus = 'pending';
      update.credentialEmailError = '';
      shouldEmailCredentials = true;
    }

    const result = await db.collection('clientProjects').findOneAndUpdate(
      { _id: projectId },
      { $set: update },
      { returnDocument: 'after' }
    );

    let finalProject = result;
    let responseMessage = 'Client project saved successfully.';

    if (shouldEmailCredentials) {
      try {
        await sendClientPortalCredentials(finalProject, plainPassword);
        finalProject = await db.collection('clientProjects').findOneAndUpdate(
          { _id: projectId },
          {
            $set: {
              credentialsSentAt: new Date(),
              credentialEmailStatus: 'sent',
              credentialEmailError: '',
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after' }
        );
        responseMessage = suppliedPassword
          ? 'Client project saved and password reset email sent successfully.'
          : 'Client project saved and portal credentials emailed successfully.';
      } catch (emailErr) {
        finalProject = await db.collection('clientProjects').findOneAndUpdate(
          { _id: projectId },
          {
            $set: {
              credentialEmailStatus: 'failed',
              credentialEmailError: emailErr.message,
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after' }
        );
        responseMessage = 'Client project saved, but credential email failed to send.';
      }
    }

    res.json({ project: sanitizeProject(finalProject), message: responseMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/me/password', clientAuth, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required' });
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters and include uppercase, lowercase, number, and symbol' });
    }

    const db = getDB();
    const project = await db.collection('clientProjects').findOne({ _id: new ObjectId(req.client.projectId) });
    if (!project?.password) return res.status(404).json({ message: 'Project login not found' });

    const valid = await bcrypt.compare(currentPassword, project.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    await db.collection('clientProjects').updateOne(
      { _id: project._id },
      {
        $set: {
          password: await bcrypt.hash(newPassword, 12),
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid project id' });
    const db = getDB();
    const result = await db.collection('clientProjects').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Client project not found' });
    res.json({ message: 'Client project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

