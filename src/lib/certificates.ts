import 'server-only';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { certificates, type Certificate } from '@/content/certificates';

const imageExtension = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const imageOrder = new Intl.Collator('en', { numeric: true });

export async function getCertificates(): Promise<Certificate[]> {
  return Promise.all(certificates.map(async (certificate) => {
    const { folder } = certificate;
    const directory = join(process.cwd(), 'public', 'certificates', folder);
    const files = await readdir(directory, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    const images = files
      .filter((file) => file.isFile() && !file.name.startsWith('.') && imageExtension.test(file.name))
      .map((file) => file.name)
      .sort(imageOrder.compare)
      .map((name) => `/certificates/${folder}/${encodeURIComponent(name)}`);

    return { ...certificate, images };
  }));
}
