type CertificateEntry = { folder: string; name: string; assetFolder?: string };

export const certificates: readonly CertificateEntry[] = [
  { folder: 'japanese-cultural-program', name: 'Japanese Culturual Program', assetFolder: 'Japanese Cultural Program' },
  { folder: 'icas-mathematics', name: 'ICAS Mathematics' },
  { folder: 'program-leadership-outreach', name: 'Program Leadership Outreach' },
  { folder: 'petronasains-carnival', name: 'Petronasains Carnival' },
  { folder: 'drobotex', name: 'DROBOTEX' },
  { folder: 'kem-minda-bestari', name: 'Kem Minda Bestari' },
  { folder: 'iet-faraday-challenge', name: 'IET Faraday Challenge' },
  { folder: 'drone-racing-league-challenge', name: 'Drone Racing League Challenge' },
  { folder: 'drama-competition', name: 'Drama Competition' },
  { folder: 'dean-list-matriculation', name: 'Dean List Matriculation' },
  { folder: 'student-exchange-ub', name: 'Student Exchange Programme in Universitas Brawijaya Indonesia', assetFolder: 'Student Exchange Programme In Universitas Brawijaya Indonesia' },
  { folder: 'apac-cybersecurity-fund', name: 'APAC Cybersecurity Fund' },
  { folder: 'anthropic', name: 'Anthropic' },
  { folder: 'deriv-ai-hackathon', name: 'Deriv AI Hackathon' },
  { folder: 'dean-list-unimas', name: 'Dean List UNIMAS' },
  { folder: 'e-latih', name: 'e-Latih Human Resource Development Corporation', assetFolder: 'e-Latih Human Resources Development Corporation' },
  { folder: 'it-support-training', name: 'IT Support Training Milesstones', assetFolder: 'IT ServiceDesk Simulation' },
  { folder: 'kyouth-development-programme', name: 'KYouth Development Programme' },
  { folder: 'cisco-network-academy', name: 'CISCO Network Academy' },
  { folder: 'centexs-eon-xr', name: 'CENTEXS Augmented Reality: EON-XR For Educator', assetFolder: 'CENTEXS Augmented Reality EON-XR For Educator' },
  { folder: 'seminar-aku-kasih-malaysia', name: 'Seminar Aku Kasih Malaysia' },
  { folder: 'ai-untuk-rakyat-madani', name: 'AI Untuk Rakyat MADANI' },
];

export type Certificate = Pick<CertificateEntry, 'folder' | 'name'> & { images: string[] };
