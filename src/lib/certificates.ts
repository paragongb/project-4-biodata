import 'server-only';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { certificates, type Certificate } from '@/content/certificates';

const imageExtension = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const imageOrder = new Intl.Collator('en', { numeric: true });

export async function getCertificates(): Promise<Certificate[]> {
  const root = join(process.cwd(), 'public', 'certificates');
  const entries = await readdir(root, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const folders = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));

  return Promise.all(certificates.map(async ({ folder, name, assetFolder }) => {
    const candidates = [...new Set([folder, assetFolder ?? name])];
    const images = await Promise.all(candidates.filter((candidate) => folders.has(candidate)).map(async (candidate) => {
      const files = await readdir(join(root, candidate), { withFileTypes: true });
      return files
        .filter((file) => file.isFile() && !file.name.startsWith('.') && imageExtension.test(file.name))
        .map((file) => file.name)
        .sort(imageOrder.compare)
        .map((file) => `/certificates/${encodeURIComponent(candidate)}/${encodeURIComponent(file)}`);
    }));

    return { folder, name, images: images.flat() };
  }));
}
