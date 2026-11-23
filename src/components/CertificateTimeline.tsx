import { useState } from 'react';
import type { Certificate } from '@/content/certificates';

export default function CertificateTimeline({ certificates }: { certificates: Certificate[] }) {
  return (
    <ol className="panel-timeline" role="list">
      {certificates.map((certificate) => (
        <CertificateEntry key={certificate.folder} certificate={certificate} />
      ))}
    </ol>
  );
}

function CertificateEntry({ certificate }: { certificate: Certificate }) {
  const { folder, name, images } = certificate;
  const [index, setIndex] = useState(0);
  const hasMultipleImages = images.length > 1;
  const frameId = `certificate-${folder}`;

  return (
    <li>
      <h3>
        {hasMultipleImages ? (
          <button
            className="certificate-next"
            type="button"
            aria-controls={frameId}
            onClick={() => setIndex((current) => (current + 1) % images.length)}
          >
            <span>{name}</span>
            <span className="sr-only">, next photo</span>
          </button>
        ) : name}
      </h3>
      <div className="timeline-image-placeholder" id={frameId}>
        {images.length > 0 && <img src={images[index]} alt={`${name} certificate`} loading="lazy" />}
      </div>
      {hasMultipleImages && (
        <p className="certificate-photo-count" role="status">Photo {index + 1} of {images.length}</p>
      )}
    </li>
  );
}
