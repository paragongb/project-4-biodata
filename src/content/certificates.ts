export const certificates = [
  { folder: 'japanese-cultural-program', name: 'Japanese Culturual Program' },
  { folder: 'icas-mathematics', name: 'ICAS Mathematics' },
  { folder: 'program-leadership-outreach', name: 'Program Leadership Outreach' },
  { folder: 'petronasains-carnival', name: 'Petronasains Carnival' },
  { folder: 'drobotex', name: 'DROBOTEX' },
  { folder: 'kem-minda-bestari', name: 'Kem Minda Bestari' },
  { folder: 'iet-faraday-challenge', name: 'IET Faraday Challenge' },
  { folder: 'drone-racing-league-challenge', name: 'Drone Racing League Challenge' },
  { folder: 'drama-competition', name: 'Drama Competition' },
  { folder: 'student-exchange-ub', name: 'Student Exchange Programme in Universitas Brawijaya Indonesia' },
  { folder: 'apac-cybersecurity-fund', name: 'APAC Cybersecurity Fund' },
  { folder: 'anthropic', name: 'Anthropic' },
  { folder: 'deriv-ai-hackathon', name: 'Deriv AI Hackathon' },
  { folder: 'e-latih', name: 'e-Latih Human Resource Development Corporation' },
  { folder: 'it-support-training', name: 'IT Support Training Milesstones' },
  { folder: 'kyouth-development-programme', name: 'KYouth Development Programme' },
  { folder: 'cisco-network-academy', name: 'CISCO Network Academy' },
  { folder: 'centexs-eon-xr', name: 'CENTEXS Augmented Reality: EON-XR For Educator' },
  { folder: 'ai-untuk-rakyat-madani', name: 'AI Untuk Rakyat MADANI' },
] as const;

export type Certificate = (typeof certificates)[number] & { images: string[] };
