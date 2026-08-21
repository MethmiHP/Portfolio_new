import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, getDB } from './config/db.js';

dotenv.config({ override: process.env.NODE_ENV !== 'production' });

const defaultPortfolio = {
  key: 'main',
  greeting: "Hello, I'm",
  name: 'SANDARU KAUSHAN',
  title: 'FULL-STACK DEVELOPER & AI SPECIALIST',
  tagline: 'Turning ideas into powerful digital experiences.',
  bio: 'Full-stack developer and Data Scientist with hands-on experience in AI, Speech-to-Text systems, and enterprise software. From sketch to production on AWS — building solutions that scale.',
  availability: 'AVAILABLE WORLDWIDE',
  topLabel: 'FULL-STACK DEVELOPER / AI SPECIALIST',
  topBadge: 'AVAILABLE FOR FREELANCE',
  stats: [
    { value: '3+', label: 'YEARS EXPERIENCE' },
    { value: '10+', label: 'PROJECTS COMPLETED' },
    { value: '9', label: 'COURTROOMS LIVE' },
    { value: '5+', label: 'TECH STACKS MASTERED' },
  ],
  education: [
    { year: '2024', degree: 'Full-Stack Development & AI', school: 'Hands-on Industry Experience' },
    { year: '2023', degree: 'Data Science & Machine Learning', school: 'Self-directed & Professional Projects' },
  ],
  experience: [
    {
      company: 'SLT',
      role: 'Full-Stack Developer',
      description: 'Hands-on experience with internal call center project — building and maintaining enterprise communication systems.',
    },
    {
      company: 'Ministry of Justice, Sri Lanka',
      role: 'AI / Speech-to-Text Engineer',
      description: 'Built and fine-tuned multi-language transcription models for courtroom proceedings. System now deployed across 9 courtrooms nationwide.',
    },
  ],
  skills: [
    'REACT', 'REACT NATIVE', 'TYPESCRIPT', 'JAVASCRIPT',
    'NODE.JS', 'EXPRESS.JS', 'PYTHON', 'FASTAPI',
    'MONGODB', 'FIREBASE', 'AI / MACHINE LEARNING',
    'DEEP LEARNING', 'COMPUTER VISION', 'SPEECH-TO-TEXT',
    'TENSORFLOW', 'PYTORCH', 'OPENCV', 'VERTEX AI',
    'AWS', 'DOCKER', 'KUBERNETES', 'REST APIS',
    'MOBILE APP DEVELOPMENT', 'FULL-STACK DEVELOPMENT',
    'BLENDER 3D', 'AFTER EFFECTS', 'PHOTOSHOP', 'FIGMA',
    'VIDEO EDITING',
  ],
  workProcess: [
    { step: '01', title: 'DISCOVER', description: 'Understanding requirements, users, and business goals through research and collaboration.', icon: 'search' },
    { step: '02', title: 'IDEATE', description: 'Brainstorming solutions, exploring AI capabilities, and defining the optimal architecture.', icon: 'bulb' },
    { step: '03', title: 'DESIGN', description: 'Crafting UI/UX, 3D mockups, flyers, and visual assets that communicate clearly.', icon: 'design' },
    { step: '04', title: 'DEVELOP', description: 'Building robust full-stack systems with clean code, APIs, and cloud deployment on AWS.', icon: 'code' },
    { step: '05', title: 'DELIVER', description: 'Deploying, fine-tuning AI models, and ensuring production-ready performance at scale.', icon: 'deliver' },
  ],
  quote: {
    text: 'Great software blends engineering precision with creative vision — from courtroom AI to restaurant POS, every line of code should solve a real problem.',
    signature: 'Sandaru Kaushan',
    cta: "LET'S CREATE SOMETHING GREAT TOGETHER.",
  },
  contact: {
    heading: "LET'S WORK TOGETHER",
    description: 'Open to freelance projects, full-time roles, and collaborations in full-stack development, AI, and creative design.',
    cta: 'AVAILABLE FOR FREELANCE',
    email: 'sandarukaushan999@gmail.com',
    website: 'www.sandarukaushan.online',
    phone: '+94 77 XXX XXXX',
    location: 'Sri Lanka',
    socialLinks: [
      { label: 'GitHub', type: 'github', url: 'https://github.com/' },
      { label: 'LinkedIn', type: 'linkedin', url: 'https://www.linkedin.com/' },
      { label: 'Fiverr', type: 'fiverr', url: 'https://www.fiverr.com/' },
      { label: 'WhatsApp', type: 'whatsapp', url: 'https://wa.me/94766674884' },
    ],
  },
  about: 'Beyond code, I design back-print T-shirt graphics, create 3D mockups in Blender, craft flyers, and produce video content using After Effects and Photoshop.',
};

const defaultProjects = [
  {
    title: 'Courtroom Speech-to-Text',
    subtitle: 'AI TRANSCRIPTION SYSTEM',
    description: 'Multi-language speech-to-text transcription system for Sri Lanka Ministry of Justice courtrooms. Fine-tuned models for legal proceedings — now live in 9 courtrooms.',
    technologies: ['Python', 'AI/ML', 'AWS', 'Speech-to-Text'],
    order: 1,
    image: '',
    video: '',
    link: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'SLT Call Center Platform',
    subtitle: 'ENTERPRISE COMMUNICATION',
    description: 'Internal call center project at SLT — full-stack development of enterprise communication and management systems.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    order: 2,
    image: '',
    video: '',
    link: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Restaurant POS System',
    subtitle: 'POINT OF SALE',
    description: 'Complete POS system built for cafes and restaurants — order management, billing, and inventory tracking.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    order: 3,
    image: '',
    video: '',
    link: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'ERP & Sales Mobile App',
    subtitle: 'BUSINESS MANAGEMENT',
    description: 'ERP system with integrated sales representative mobile application for field teams and business operations.',
    technologies: ['React Native', 'Node.js', 'MongoDB'],
    order: 4,
    image: '',
    video: '',
    link: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  await connectDB();
  const db = getDB();

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await db.collection('admin').updateOne(
    { username: process.env.ADMIN_USERNAME },
    {
      $set: {
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
      },
    },
    { upsert: true },
  );
  console.log('Admin user seeded');

  const existingPortfolio = await db.collection('portfolio').findOne({ key: 'main' });
  if (!existingPortfolio) {
    await db.collection('portfolio').insertOne(defaultPortfolio);
    console.log('Portfolio data seeded');
  } else {
    console.log('Portfolio already exists, skipping');
  }

  const projectCount = await db.collection('projects').countDocuments();
  if (projectCount === 0) {
    await db.collection('projects').insertMany(defaultProjects);
    console.log('Default projects seeded');
  } else {
    console.log('Projects already exist, skipping');
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
