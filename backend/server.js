import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import portfolioRoutes from './routes/portfolio.js';
import qaRoutes from './routes/qa.js';
import clientProjectRoutes from './routes/clientProjects.js';
import mediaRoutes from './routes/media.js';
import { verifyEmailConnection } from './services/emailService.js';

// During local development, the project .env should win over stale variables
// inherited from an older terminal session. Hosted production variables remain
// authoritative and no local .env file is required there.
dotenv.config({ override: process.env.NODE_ENV !== 'production' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/client-projects', clientProjectRoutes);
app.use('/api/media', mediaRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    verifyEmailConnection();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.error(
        'Check that MONGODB_URI in backend/.env exactly matches the current MongoDB Atlas connection string.'
      );
    } else if (err.message?.includes('IP') || err.message?.includes('whitelist')) {
      console.error('Check MongoDB Atlas Network Access and allow this machine\'s current public IP.');
    }
    process.exit(1);
  });
