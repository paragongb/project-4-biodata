// Every clickable thing on the shelf. Order = list-view order.
import { site } from './site';

export type SectionId =
  | 'projects' | 'experience' | 'github' | 'spotify' | 'skills' | 'certs'
  | 'about' | 'contact' | 'resume' | 'terminal' | 'research' | 'now' | 'previous-services';

export const sections: { id: SectionId; title: string; kicker: string; href?: string }[] = [
  { id: 'projects', title: 'Projects', kicker: 'storage box · case studies', href: '/projects' },
  { id: 'experience', title: 'Experience', kicker: 'city block' },
  { id: 'resume', title: 'CV', kicker: 'leaning frame · PDF', href: site.resumePdf },
  { id: 'skills', title: 'Skills', kicker: 'keyboard', href: '/resume#skills' },
  { id: 'certs', title: 'Certifications', kicker: 'binders' },
  { id: 'github', title: 'GitHub', kicker: 'contribution skyline · live' },
  { id: 'spotify', title: 'Spotify', kicker: 'record player · featured track' },
  { id: 'about', title: 'About', kicker: 'framed · who I am', href: '/about' },
  { id: 'now', title: 'Now', kicker: 'sticky note · what I’m up to' },
  { id: 'contact', title: 'Contact', kicker: 'letters · say hi' },
  { id: 'research', title: 'Research', kicker: 'magazines' },
  { id: 'previous-services', title: 'Previous Services', kicker: 'scrolls' },
  { id: 'terminal', title: 'Terminal', kicker: 'crt · type help' },
];

export const sectionById = (id: SectionId) => sections.find((s) => s.id === id)!;
