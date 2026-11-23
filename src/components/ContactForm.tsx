'use client';

import { useState, type FormEvent } from 'react';
import { site } from '@/content/site';

export default function ContactForm() {
  const [error, setError] = useState('');

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name') ?? '').trim();
    const message = String(fields.get('message') ?? '').trim();
    const date = String(fields.get('date') ?? '');
    if (!name || !message || !date) {
      setError('Enter your name, message, and date.');
      return;
    }

    setError('');
    const draft = `Hi Gerard,\n\n${message}\n\nName: ${name}\nDate: ${date}`;
    window.location.assign(`${site.links.whatsapp}?text=${encodeURIComponent(draft)}`);
  }

  return (
    <form className="contact-form" onSubmit={send}>
      <label>
        Name
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        Message
        <textarea name="message" rows={5} required />
      </label>
      <label>
        Date
        <input name="date" type="date" required />
      </label>
      <button type="submit" aria-describedby="contact-whatsapp-hint">Send</button>
      <p id="contact-whatsapp-hint">Opens WhatsApp with your message ready to send.</p>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
