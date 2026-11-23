import Home from '@/components/Home';
import { getCertificates } from '@/lib/certificates';

export default async function Page() {
  return <Home certificates={await getCertificates()} />;
}
