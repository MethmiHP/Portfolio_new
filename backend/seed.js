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
    { year: '2023', degree: 'Data Science', school: 'Self-directed & Professional Projects' },
    { year: '2022', degree: 'G.C.E. A/L — 1A and 2Bs', school: 'Logic, Information Technology and Mathematics' },
  ],
  experience: [
    {
      company: 'SLT',
      role: 'Full-Stack Developer',
      description: 'Gained hands-on experience developing and maintaining a multi-tenant AI agent management platform. Contributed to frontend development using React, backend services using Flask, and application deployment on Ubuntu Linux using Docker and Docker Compose. Worked on agent creation, configuration, and knowledge base management features, and integrated the Stripe payment gateway.',
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
    'MONGODB', 'FIREBASE', 'AI',
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
    email: 'meth.pathirana@gmail.com',
    website: 'www.sandarukaushan.online',
    phone: '+94 76 533 6698',
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
    "title": "Smart Solars",
    "subtitle": "ENERGY & MICROGRID MANAGEMENT",
    "period": "Aug – Oct 2026",
    "role": "Team Member",
    "description": "Built station and microgrid management features, including station creation and updates, availability, address search, geolocation, and nearby-station maps. The platform also supports energy slot bookings, reservations, QR verification, and an operator dashboard.",
    "technologies": [
      "React",
      "ASP.NET Core",
      "Native Android",
      "MongoDB",
      "SQLite",
      "Google Maps"
    ],
    "link": "https://github.com/MethmiHP/EAD_Project.git",
    "category": "Development",
    "order": 1
  },
  {
    "title": "MEDICHANNEL",
    "subtitle": "SMART HEALTHCARE PLATFORM",
    "period": "Apr 2026",
    "role": "Team Member",
    "description": "Contributed to a microservices healthcare platform covering patients, doctors, appointments, payments, prescriptions, notifications, and AI services. My primary responsibility was telemedicine session management, Jitsi video consultations, and email/SMS notifications.",
    "technologies": [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Docker",
      "Kubernetes",
      "Jitsi"
    ],
    "link": "https://github.com/MethmiHP/DS-Project.git",
    "category": "Development",
    "order": 2
  },
  {
    "title": "MINIMINDS",
    "subtitle": "KIDS SCIENCE LEARNING PLATFORM",
    "period": "Mar – Apr 2026",
    "role": "Team Member",
    "description": "Developed tutorial management and YouTube video integration using the YouTube API. The platform includes experiments, quizzes, progress tracking, and science kit management.",
    "technologies": [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js",
      "YouTube API"
    ],
    "link": "https://github.com/MethmiHP/AF-Project.git",
    "category": "Development",
    "order": 3
  },
  {
    "title": "My Health",
    "subtitle": "HOSPITAL MANAGEMENT SYSTEM",
    "period": "Oct 2025",
    "role": "Team Leader",
    "description": "Led a hospital management project supporting appointments, patient records, payments, and analytics. My primary responsibility was patient record management with barcode and scanner interfaces.",
    "technologies": [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js"
    ],
    "link": "https://github.com/MethmiHP/My_Health.git",
    "category": "Development",
    "order": 4
  },
  {
    "title": "GREENLOOP",
    "subtitle": "REUSE, RECYCLE & TRACK CONSUMPTION",
    "period": "Oct 2025",
    "role": "Team Leader",
    "description": "Led a mobile application for waste management and consumption tracking. Developed the notification system and points and badges features, alongside user management and analytics.",
    "technologies": [
      "React Native",
      "Expo",
      "Firebase"
    ],
    "link": "https://github.com/MethmiHP/GreenLoop_mobileAPP2.git",
    "category": "Development",
    "order": 5
  },
  {
    "title": "NELSON ENTERPRISES",
    "subtitle": "GASES & ACCESSORIES MANAGEMENT",
    "period": "Feb – Apr 2025",
    "role": "Team Leader",
    "description": "Led a management system covering users, inventory, orders, delivery, and customer support. My primary responsibility was the shopping cart, order placement, and payment handling.",
    "technologies": [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js"
    ],
    "link": "https://github.com/MethmiHP/Gas-Management.git",
    "category": "Development",
    "order": 6
  },
  {
    "title": "MOMENTO",
    "subtitle": "EVENT BOOKING APP",
    "period": "Mar 2025",
    "role": "UI/UX Design",
    "description": "Designed and prototyped an event booking application in Figma as a second-year university project.",
    "technologies": [
      "Figma",
      "UI/UX Design",
      "Prototyping"
    ],
    "link": "https://drive.google.com/drive/folders/12uOse-dqW2uT_g4bqDsrzG89sJGwRvtd?usp=sharing",
    "category": "Development",
    "order": 7
  },
  {
    "title": "Music Store System",
    "subtitle": "OBJECT-ORIENTED JAVA APPLICATION",
    "period": "Jul – Nov 2024",
    "role": "",
    "description": "Developed a music store system using Java and object-oriented programming concepts as a first-year university project.",
    "technologies": [
      "Java",
      "Object-Oriented Programming"
    ],
    "link": "",
    "category": "Development",
    "order": 8
  }
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
