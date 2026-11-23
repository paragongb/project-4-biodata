'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { experience, skills, terminalResume } from '@/content/resume';
import { site } from '@/content/site';

const command = 'help';
const prompt = `${site.githubUsername}@portfolio:~$`;

export default function Terminal() {
  const [input, setInput] = useState('');
  const [showResume, setShowResume] = useState(false);
  const [invalidCommand, setInvalidCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }); }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = input.trim();
    setInput('');
    if (!entered) return;

    if (entered === command) {
      setInvalidCommand('');
      setShowResume(true);
    } else {
      setInvalidCommand(entered);
    }
  }

  return (
    <div className="term" role="region" aria-label="Terminal">
      <p id="terminal-hint" className="term-hint">Type <code>{command}</code> and press Enter to view my résumé.</p>
      <form className="term-input-row" onSubmit={submit}>
        <span className="term-prompt" aria-hidden="true">{prompt}</span>
        <input
          ref={inputRef}
          className="term-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          enterKeyHint="go"
          aria-label="Terminal command"
          aria-describedby="terminal-hint"
        />
      </form>
      <div role="status">
        {invalidCommand
          ? <p className="term-error">Unknown command: {invalidCommand}. Try <code>{command}</code>.</p>
          : showResume && <span className="sr-only">Résumé displayed below.</span>}
      </div>
      {showResume && <TerminalResume />}
    </div>
  );
}

function TerminalResume() {
  const { name, location, email, linkedin, summary, education, achievements, projects, activities, references } = terminalResume;

  return (
    <article className="term-resume" aria-labelledby="terminal-resume-name">
      <header>
        <p aria-hidden="true"><span className="term-prompt">{prompt}</span> {command}</p>
        <h3 id="terminal-resume-name">{name}</h3>
        <p className="term-meta">{location}</p>
        <ul className="term-links" aria-label="Contact and résumé links">
          <li><a href={`mailto:${email}`}>Email</a></li>
          <li><a href={site.links.whatsapp}>WhatsApp</a></li>
          <li><a href={site.links.github}>GitHub</a></li>
          <li><a href={linkedin}>LinkedIn</a></li>
          <li><a href={site.resumePdf}>PDF résumé</a></li>
        </ul>
      </header>

      <section>
        <h4>Profile</h4>
        <p>{summary}</p>
      </section>

      <section>
        <h4>Education</h4>
        {education.map(({ school, dates, details }) => (
          <div className="term-entry" key={school}>
            <p className="term-meta">{dates}</p>
            <h5>{school}</h5>
            <p>{details}</p>
          </div>
        ))}
      </section>

      <section>
        <h4>Work experience</h4>
        {experience.map(({ company, title, dates, highlights }) => (
          <div className="term-entry" key={company}>
            <p className="term-meta">{dates}</p>
            <h5>{title}</h5>
            <p>{company}</p>
            <ul>{highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h4>Achievements &amp; certifications</h4>
        <ul>
          {achievements.map(([year, label]) => (
            <li key={label}><span className="term-meta">[{year}]</span> {label}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Projects</h4>
        {projects.map(({ name, tools, details }) => (
          <div className="term-entry" key={name}>
            <h5>{name}</h5>
            <p className="term-meta">stack = {tools}</p>
            <p>{details}</p>
          </div>
        ))}
      </section>

      <section>
        <h4>Skills</h4>
        {skills.map(({ group, items, levels }) => (
          <div className="term-entry" key={group}>
            <h5>{group}</h5>
            <p>{items.map((item) => levels ? `${item} (${levels[item] ?? 'Intermediate'})` : item).join(', ')}</p>
          </div>
        ))}
      </section>

      <section>
        <h4>Activities &amp; involvement</h4>
        <p className="term-meta">Facilitator</p>
        <ul>{activities.map((activity) => <li key={activity}>{activity}</li>)}</ul>
      </section>

      <section>
        <h4>References</h4>
        <ul>
          {references.map(({ name, organisation }) => <li key={name}>{name} · {organisation}</li>)}
        </ul>
      </section>
    </article>
  );
}
