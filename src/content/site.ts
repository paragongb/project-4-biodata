// Basics + links. Single source of truth for the header, metadata, résumé and contact panel.

const githubUsername = 'paragongb';

export const site = {
  wordmark: '_GerardBobby',
  name: 'Gerard Bobby',
  resumePdf: '/Resume_Gerard_Bobby.pdf',
  title: 'Software portfolio',
  description:
    'Gerard Bobby’s portfolio of software projects, from e-commerce and sign-language learning to Roblox game development and digital piano.',
  links: {
    github: `https://github.com/${githubUsername}`,
    whatsapp: 'https://wa.me/601151811980',
  },
  githubUsername,
  featuredTrack: {
    title: 'Pluto Projector',
    artist: 'Rex Orange County',
    spotifyId: '4EWBhKf1fOFnyMtUzACXEc',
    artwork: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02bf6bb9e37fd5aaa8f8559f07',
  },
  githubStats: {
    contributionsLast20Weeks: 2,
    contributionsLastYear: 8,
  },
} as const;
