import type { StaticImageData } from 'next/image';

export type Project = {
  slug: string;
  name: string;
  oneLiner?: string;
  problem?: string;
  implementation?: string;
  constraints?: string;
  role?: string;
  stack?: string[];
  built?: { label?: string; text: string }[];
  also?: string[];
  outcome?: string;
  outcomeHeading?: 'Outcome' | 'Outcomes';
  links?: { label: string; href: string; note?: string }[];
  screenshots?: { src: StaticImageData; alt: string }[];
  demonstrationPlaceholder?: boolean;
  showEmptyDetails?: boolean;
  tags?: string; // short stack summary for lists
};

export const projects: Project[] = [
  {
    slug: 'traditional-clothes-e-commerce-platform',
    name: 'Traditional Clothes E-Commerce Platform',
    problem: 'My mother relied on third-party marketplaces such as Shopee, where commission fees, taxes, promotions, and coupons could reduce the effective selling price. This project explored an independent store that gives her greater control of pricing, promotions, and customer transactions.',
    implementation: 'I built an enterprise-style application with JHipster, Spring Boot, and Vue.js. A Java REST API connects the frontend and backend, MySQL manages application, customer, and product data, and WhatsApp supports communication and transactions between customers and the seller.',
    constraints: "JHipster's generated structure required substantial storage and hosting resources, so the prototype remained unhosted due to budget constraints. I also learned the importance of designing the relational schema before generating entities, because later regeneration can overwrite custom changes.",
    outcome: 'The completed prototype demonstrated the intended e-commerce workflow and helped my mother understand how an independently managed online store could showcase products and handle orders.',
    stack: ['Java', 'Spring Boot', 'JHipster', 'Vue.js', 'TypeScript', 'REST API', 'MySQL', 'SCSS', 'Git', 'WhatsApp'],
    demonstrationPlaceholder: true,
  },
  {
    slug: 'sign-language-learning-web-application',
    name: 'Sign Language Learning Web Application',
    problem: 'Limited knowledge of sign language can make communication with members of the deaf community more difficult. Sign-language education is not widely incorporated into institutions, while some existing resources are passive or constrained by recognition accuracy.',
    implementation: 'I chose Django because its Python ecosystem made it practical to combine web features and machine learning. Users can explore guided signs, test their memory through quizzes, search a sign dictionary, and use translation features. Camera-captured hand signs are recognised from different angles and converted into predictions.',
    constraints: 'Motion-capture-quality data and equipment were unavailable, so images were used as the dataset. Recognition accuracy depended on the quantity and diversity of training images; hosting and database limits restricted both.',
    outcome: 'The website was published publicly and demonstrated how machine learning and web development can create a more interactive way to learn basic sign language.',
    stack: ['Python', 'Django', 'HTML', 'CSS', 'JavaScript', 'MySQL', 'TensorFlow', 'PyTorch', 'MediaPipe', 'Git'],
    demonstrationPlaceholder: true,
  },
  {
    slug: 'steal-a-dungeon',
    name: 'Steal A Dungeon (Roblox)',
    problem: 'Video games are a key hobby of mine, and I wanted to understand development beyond playing. The project gave me a space to develop a creative concept, draw from player experience, and improve gameplay mechanics.',
    implementation: 'Players raid dungeons until a boss fight, collecting randomized rewards to upgrade their base and defensive turrets. Those defences protect against other players destroying the base. Roblox Studio provided scripting, animation, multiplayer, and publishing tools in an accessible environment.',
    constraints: 'Lua and Luau were new to me compared with other languages, so I need to learn a new language alongside Roblox Studio and the fundamental of game-development.',
    outcome: 'The game is published for Roblox players and remains in alpha. Its dungeon-raiding, reward, upgrading, and base-defence loop was designed to be quick to learn.',
    outcomeHeading: 'Outcomes',
    stack: ['Roblox', 'Roblox Studio', 'Lua', 'Luau', 'Animation Editor'],
    demonstrationPlaceholder: true,
  },
  {
    slug: 'oil-palm-disease',
    name: 'Palm Oil Disease Detection',
    problem: 'Oil-palm disease can affect health, yield, and profitability. Manual visual inspection may be slow, subjective, and dependent on specialist knowledge, especially when early symptoms are subtle.',
    implementation: 'I built an interactive Streamlit app that resizes an uploaded JPG or PNG to 224×224, runs prediction through TensorFlow/Keras, shows confidence and the top three results, and estimates a Healthy, Mild, Moderate, or Severe status. The status is an accessible screening aid, not a diagnosis.',
    constraints: 'The system supports only three classes and is sensitive to image quality, lighting, angle, and relevance. Severity is inferred from classifier confidence and uncertainty rather than a separately trained model. The 31 MB model and TensorFlow runtime make deployment heavier, while the repository lacks training data, field validation, and evaluation metrics.',
    outcome: 'The prototype delivers an end-to-end workflow for image upload, preprocessing, classification, confidence scoring, top-three probabilities, severity estimation, and user-facing alerts. It is best positioned as a proof of concept pending broader data, testing, validation, and deployment work.',
    outcomeHeading: 'Outcomes',
    stack: ['Python', 'Streamlit', 'TensorFlow', 'Keras', 'NumPy', 'Matplotlib', 'Git'],
    demonstrationPlaceholder: true,
  },
  {
    slug: 'it-ticketing-simulation',
    name: 'IT Ticketing Simulation',
    outcomeHeading: 'Outcomes',
    demonstrationPlaceholder: true,
    showEmptyDetails: true,
  },
  {
    slug: 'digital-piano',
    name: 'Digital Piano',
    problem: 'Learning piano can be difficult without a physical piano or MIDI keyboard. Basic virtual pianos may lack realistic sound, useful controls, or clear guidance for practising MIDI songs.',
    implementation: 'The application lets users play a sampled 88-key piano with an on-screen or computer keyboard, change octaves, control volume, and enable sustain. It loads MIDI files, supports play, pause, stop, seeking, and 0.25×–2× speed, then synchronises playback with active-key highlighting and falling notes.',
    constraints: 'The Salamander Grand Piano library contains hundreds of WAV files, so the engine loads six selected velocity layers rather than all sixteen. Real-time audio required separating processing from UI work: the audio callback drives MIDI timing, while the interface polls state for visual updates. The current build focuses on mouse and computer-keyboard input, with no external MIDI controller support, recording, advanced pedal handling, or full MIDI-event interpretation.',
    outcome: 'The completed application provides realistic sampled playback, MIDI-song controls, synchronized falling-note guidance, and saved volume and octave preferences for casual playing and practice.',
    outcomeHeading: 'Outcomes',
    stack: ['C++', 'CMake', 'JUCE Framework', 'WAV Audio Samples', 'MIDI File Parsing', 'Real-Time Audio Processing', 'Audio Synthesis', 'GUI Development', 'STL', 'Git'],
    demonstrationPlaceholder: true,
  },
  {
    slug: 'it-ticket-management-system-module',
    name: 'IT Ticket Management System Module',
    outcomeHeading: 'Outcomes',
    demonstrationPlaceholder: true,
    showEmptyDetails: true,
  },
  {
    slug: 'visual-foxpro-inventory-management-system',
    name: 'Visual Fox Pro: Simple Inventory Management System',
    outcomeHeading: 'Outcomes',
    demonstrationPlaceholder: true,
    showEmptyDetails: true,
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
