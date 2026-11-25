export const experience = [
  {
    company: 'Mustafa, Kueh Tambi Advocates',
    shelfLabel: 'MKTA',
    title: 'IT Executive | Software Developer (PROTÉGÉ)',
    dates: 'Nov 2026 – Present',
    highlights: [
      'Diagnose and resolve hardware, software, and peripheral issues in the office.',
      'Proposed a centralised IT ticket management and documentation system to help future IT support staff and administrators resolve recurring issues.',
    ],
  },
  {
    company: 'Public Mutual Berhad',
    shelfLabel: 'PMB',
    title: 'Part-Time Public Mutual Consultant',
    dates: 'Sep 2026 – Present',
    highlights: [
      'Assess clients’ financial situations and risk tolerances to help them set long-term investment objectives and build portfolios.',
      'Develop communication and business pitching skills through conversations with prospective investors.',
      'Build long-term relationships with investors by answering questions and following up on their investments.',
    ],
  },
  {
    company: 'Sarawak Information Systems Sdn. Bhd. (SAINS)',
    shelfLabel: 'SAINS',
    title: 'Industrial Trainee Internship',
    dates: 'Mar 2025 – Aug 2025',
    highlights: [
      'Assigned to implement a paperless employee loan application system in the Specialized System Development department.',
      'Used JHipster with HTML, Vue.js, and TypeScript for the frontend, Java for the backend, and MySQL for the database.',
    ],
  },
];

// ---- skills (keyboard keycaps) ----
type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export const skills: { group: string; items: string[]; levels?: Record<string, SkillLevel> }[] = [
  {
    group: 'Programming Skills',
    items: ['C', 'C++', 'Lua', 'Python', 'Java', 'HTML', 'CSS', 'JS', 'PHP', 'VDM++', 'MySQL', 'SQLite', 'Laravel', 'Django', 'JHipster'],
    levels: { Lua: 'Beginner', 'VDM++': 'Beginner' },
  },
  {
    group: 'Technical Skills',
    items: ['Microsoft Word', 'Microsoft Excel', 'Microsoft PowerPoint', 'Canva', 'CapCut', 'Draw.io', 'Figma', 'Visual Studio Code', 'HeidiSQL', 'HelpDesk', 'Visual Fox Pro', 'Docker', 'OBS Studio'],
    levels: { 'Microsoft Word': 'Advanced', 'Microsoft PowerPoint': 'Advanced', Canva: 'Advanced', 'Draw.io': 'Advanced' },
  },
  {
    group: 'Languages',
    items: ['Malay', 'English', 'Japanese', 'Bidayuh', 'Kadazan-Dusun', 'Iban', 'Mandarin'],
    levels: { 'Kadazan-Dusun': 'Beginner', Mandarin: 'Beginner' },
  },
  { group: 'Soft Skills', items: ['Communication Skills', 'Independent', 'Flexible', 'Leadership', 'Teamwork', 'Business Pitching', 'Troubleshooting'] },
];

export const terminalResume = {
  name: 'Gerard Anak Bobby',
  location: 'Kuching, Sarawak, Malaysia',
  email: 'jeradbobi03@gmail.com',
  portfolio: 'https://gerard-bobby-portfolio.vercel.app/',
  summary: 'Detail-oriented software engineering graduate with hands-on experience in software development, IT support, and graphic design. Developed problem-solving, communication, leadership, and teamwork skills through technical projects. Seeking new opportunities in computer science and information technology.',
  education: [
    {
      school: 'Sekolah Menengah Sains Kuching (SAINSKU)',
      dates: '2016-2021',
      details: 'Sijil Pelajaran Malaysia (SPM: 1A+, 2A, 4A-, 2B+). Ujian Pentaksiran Bahasa Antarabangsa (Bahasa Jepun: B+).',
    },
    {
      school: 'Kolej Matrikulasi Sarawak (KMSw)',
      dates: '2021–2022',
      details: 'Physical Science (CGPA 3.71, MUET Band 4.0).',
    },
    {
      school: 'University Malaysia Sarawak (UNIMAS)',
      dates: '2022-2026',
      details: 'Bachelor of Software Engineering with Honours (CGPA 3.33). Final-year project: Sign Language Learning Web Application.',
    },
  ],
  achievements: [
    ['2024', 'Dean’s List, Year 2 Semester 2'],
    ['2026', 'Dean’s List, Year 4 Semester 2'],
    ['2017', 'Unity Game Programming Challenge participant'],
    ['2024', 'MY Bootcamp Universities Hackathon participant'],
    ['2025', 'Jam AI Hackathon participant'],
    ['2026', 'My Tech Verse participant'],
    ['2018', 'DROBOTEX'],
    ['2019', 'National IET Faraday Challenge'],
    ['2023', 'Student Exchange Programme in Universitas Brawijaya Indonesia'],
    ['2026', 'Deriv AI Hackathon Challenge'],
    ['2026', 'KYouth Development Programme'],
    ['2026', 'CENTEXS Augmented Reality: EON-XR For Educator'],
  ],
  projects: [
    {
      name: 'E-Commerce for Promoting and Selling Traditional Costumes',
      tools: 'JHipster, HTML, Vue.js, TypeScript, SCSS, Java, MySQL',
      details: 'Built a full-stack online store using JHipster. Designed REST APIs and implemented relational database operations, CRUD workflows, and business logic.',
    },
    {
      name: 'Sign Language Learning Web Application',
      tools: 'Django, Python, HTML, CSS',
      details: 'Built a real-time sign language gesture classifier with OpenCV and TensorFlow. Collected and labelled a custom dataset of basic American Sign Language gestures.',
    },
    {
      name: 'IT Ticketing Triage Simulation',
      tools: 'SupportDesk Simulator',
      details: 'Triaged over 100 simulated IT tickets, practising support procedures and prioritising and categorising technical issues.',
    },
  ],
  activities: [
    'UNIMAS Co-Curriculum Volunteerism',
    'Service-Learning Malaysia University for Society (SULAM) at SMK Kota Samarahan',
    'The Amazing Race ConFest 2024',
    'Student Exchange Programme from the University of Tokai, Japan',
  ],
  references: [
    { name: 'Tay Wei Ling', organisation: 'Sarawak Information Systems Sdn. Bhd.' },
    { name: 'Lee Nung Kion', organisation: 'University Malaysia Sarawak' },
  ],
} as const;
