export const defaultPortfolio = {
  settings: {
    heroImage: '',
    aboutImage: '',
    footerCopyright: 'Methmi Pathirana. All rights reserved.',
    hireEnabled: true,
    sectionHeadings: {
      heroBg: 'PORTFOLIO',
      about: 'ABOUT ME',
      experience: 'PROFESSIONAL EXPERIENCE',
      educationSkills: 'EDUCATION & SKILLS',
      education: 'EDUCATION',
      skills: 'SKILLS',
      workProcess: 'WORK PROCESS',
      selectedProjects: 'SELECTED PROJECTS',
      viewAllProjects: 'VIEW ALL PROJECTS',
    },
    navbar: [
      { label: 'Home', href: '/#home', enabled: true },
      { label: 'About', href: '/#about', enabled: true },
      { label: 'Projects', href: '/#projects', enabled: true },
      { label: 'Skills', href: '/#skills', enabled: true },
      { label: 'Hire Me', href: '/hire', enabled: true },
      { label: 'Contact', href: '/#contact', enabled: true },
    ],
    qa: {
      toggle: 'Ask Methmi a Question',
      title: 'Ask me about your project',
      subtitle: 'Only my answered replies appear publicly.',
      latestTitle: 'Latest answers',
      replyLabel: "Methmi's Reply",
      prompt: 'Ask a hiring, collaboration, AI, full-stack, or design question.',
      success: "Thank you for your question. I’ll get back to you soon.",
    },
    hire: {
      kicker: 'Start a Project',
      heading: 'HAND OVER YOUR PROJECT',
      description: 'Share your idea, requirements, budget range, and timeline. After we agree on the project, I can create a private client login where you can track the live status, progress, and feedback.',
      clientLink: 'Existing client? View project status',
      success: 'Project request sent. I will review it and send your private client login details.',
    },
    clientPortal: {
      kicker: 'Client Portal',
      loginHeading: 'View Your Project Status',
      loginDescription: 'Use the private username and password I send after accepting your project.',
      statusKicker: 'Private Project Status',
      backLink: 'Back to Portfolio',
    },
  },
  greeting: "Hello, I'm",
  name: 'METHMI PATHIRANA',
  title: 'FULL-STACK DEVELOPER',
  tagline: 'Building scalable web applications, AI systems and powerful digital experiences.',
  bio: 'Full-stack developer from Sri Lanka with hands-on experience in React, Node.js, Python, machine learning and enterprise software. From sketch to production.',
  topLabel: 'FULL-STACK DEVELOPER',
  topBadge: 'AVAILABLE FOR FREELANCE',
  availability: 'Open to freelance projects, full-time roles, and collaborations.',
  education: [
    { year: '2026', degree: 'Bsc (Hons) in Information Technology specialized in Software Engineering', school: 'Sri Lanka Institute of Information Technology' },
    
    { year: '2022', degree: 'G.C.E. A/L — 1A and 2Bs', school: 'Logic, Information Technology and Mathematics' },
  ],
  experience: [
    {
      company: 'SLT',
      role: 'SOFTWARE ENGINEERING INTERN | FULL-STACK DEVELOPMENT',
      description: 'Gained hands-on experience developing and maintaining a multi-tenant AI agent management platform. Contributed to frontend development using React, backend services using Flask, and application deployment on Ubuntu Linux using Docker and Docker Compose. Worked on agent creation, configuration, and knowledge base management features, and integrated the Stripe payment gateway.',
    },
  
  ],
  skills: [
    'REACT', 'REACT NATIVE', 'TYPESCRIPT', 'JAVASCRIPT',
    'NODE.JS', 'EXPRESS.JS', 'PYTHON', 'FASTAPI',
    'MONGODB', 'FIREBASE','DOCKER', 'KUBERNETES', 'REST APIS',
    'MOBILE APP DEVELOPMENT', 'FULL-STACK DEVELOPMENT',
    'FIGMA',
    
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
    signature: 'Methmi Pathirana',
    cta: "LET'S CREATE SOMETHING GREAT TOGETHER.",
  },
  contact: {
    heading: "LET'S WORK TOGETHER",
    description: 'Open to freelance projects, full-time roles, and collaborations in full-stack development, AI, and creative design.',
    cta: 'AVAILABLE FOR FREELANCE',
    email: 'meth.pathirana@gmail.com',
    website: 'www.methmipathirana.online',
    phone: '+94 76 533 6698',
    location: 'Sri Lanka',
    socialLinks: [
      { label: 'GitHub', type: 'github', url: 'https://github.com/' },
      { label: 'LinkedIn', type: 'linkedin', url: 'https://www.linkedin.com/' },
      { label: 'Fiverr', type: 'fiverr', url: 'https://www.fiverr.com/' },
      { label: 'WhatsApp', type: 'whatsapp', url: 'https://wa.me/94766674884' },
    ],
  },
  about: "Hi, I'm Methmi Pathirana, a passionate Software Engineering undergraduate at SLIIT with hands-on experience in full-stack development, web applications, and modern technologies. I gained industry experience as a Software Engineering Intern at Sri Lanka Telecom. I enjoy solving problems, exploring new technologies, and building innovative, user-friendly solutions. I'm always eager to learn, grow, and take on new challenges.",
};

export const defaultProjects = [
  {
    "_id": "smart-solars",
    "image": new URL('./assets/smartSolars.png', import.meta.url).href,
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
    "_id": "medichannel",
    "image": new URL('./assets/mediChannel.png', import.meta.url).href,
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
    "_id": "miniminds",
    "image": new URL('./assets/miniMinds.png', import.meta.url).href,
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
    "_id": "my-health",
    "image": new URL('./assets/myHealth.png', import.meta.url).href,
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
    "_id": "greenloop",
    "image": new URL('./assets/greenLoop.png', import.meta.url).href,
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
    "_id": "nelson-enterprises",
    "image": new URL('./assets/Nelson.jpg', import.meta.url).href,
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
    "_id": "momento",
    "image": new URL('./assets/momento.png', import.meta.url).href,
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
    "_id": "music-store",
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
