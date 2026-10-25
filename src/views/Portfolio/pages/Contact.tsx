'use client';

import { useState } from 'react';
import { Send, GithubIcon, LinkedinIcon, Mail, AlertCircle, Code } from 'lucide-react';
import { sendContactMessage } from '../../../api';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans } from '../constants/fonts';
import { body } from '../constants/type';
import { IDECard, PageHeader, SectionLabel } from '../shared';

const channels = [
  {
    id: 'github',
    icon: <GithubIcon size={16} />,
    label: 'GitHub',
    value: portfolioData.github,
    href: `https://${portfolioData.github}`,
    description: 'Where the actual work lives.',
    color: 'var(--ide-text-1)',
  },
  {
    id: 'linkedin',
    icon: <LinkedinIcon size={16} />,
    label: 'LinkedIn',
    value: portfolioData.linkedin,
    href: `https://${portfolioData.linkedin}`,
    description: 'Professional background and roles.',
    color: '#0077b5',
  },
  {
    id: 'email',
    icon: <Mail size={16} />,
    label: 'Email',
    value: portfolioData.email,
    href: `mailto:${portfolioData.email}`,
    description: 'Fastest way to reach me.',
    color: 'var(--ide-text-1)',
  },
  {
    id: 'gist',
    icon: <Code size={16} />,
    label: 'Gist',
    value: portfolioData.gist,
    href: `https://${portfolioData.gist}`,
    description: 'Snippets and notes.',
    color: 'var(--ide-text-1)',
  },
];

const fields = [
  { key: 'name', label: 'name', placeholder: 'Your name', type: 'input' },
  { key: 'email', label: 'email', placeholder: 'your@email.com', type: 'input' },
  { key: 'subject', label: 'subject', placeholder: 'What is this about?', type: 'input' },
] as const;

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontFamily: sans,
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--ide-text-2)',
  textTransform: 'capitalize',
} as const;

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontFamily: sans,
  fontSize: 16,
  color: 'var(--ide-text-1)',
  background: 'var(--ide-bg-0)',
  border: '1px solid var(--ide-border-strong)',
  borderRadius: 4,
  transition: 'border-color 0.15s',
} as const;

export function Contact() {
  const { isMobile } = useResponsive();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Name, email and message are required.');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await sendContactMessage(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please email me directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={isMobile ? 'px-4 pt-8 pb-16' : 'px-8 pt-16 pb-24'}
      style={{ maxWidth: 776, margin: '0 auto' }}
    >
      <PageHeader title="Contact" subtitle="Use the channels below or send a message directly." />

      <IDECard style={{ marginTop: 48 }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {channels.map((ch, i) => (
            <li
              key={ch.id}
              style={i > 0 ? { borderTop: '1px solid var(--ide-border)' } : undefined}
            >
              <a
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start transition-colors ide-hover"
                style={{ gap: 16, padding: '20px 24px', textDecoration: 'none' }}
              >
                <span style={{ color: ch.color, marginTop: 3, flexShrink: 0 }}>{ch.icon}</span>
                <span className="min-w-0 flex-1">
                  <span
                    className="flex flex-wrap items-baseline justify-between"
                    style={{ gap: '4px 16px' }}
                  >
                    <span
                      className="group-hover:underline underline-offset-4"
                      style={{
                        fontFamily: sans,
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--ide-text-1)',
                      }}
                    >
                      {ch.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 14,
                        color: 'var(--ide-text-4)',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {ch.value}
                    </span>
                  </span>
                  <span style={{ ...body, display: 'block', fontSize: 15, marginTop: 2 }}>
                    {ch.description}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </IDECard>

      <section style={{ marginTop: isMobile ? 48 : 64 }}>
        <SectionLabel>Send a message</SectionLabel>

        <IDECard tape style={{ padding: isMobile ? 20 : 32 }}>
          {!sent ? (
            <div className="flex flex-col" style={{ gap: 20 }}>
              {/* Honeypot: invisible to real visitors, only a bot filling every field would touch this */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                }}
              >
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>

              {fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={`contact-${field.key}`} style={labelStyle}>
                    {field.label}
                  </label>
                  <input
                    id={`contact-${field.key}`}
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="contact-message" style={labelStyle}>
                  message
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="What do you want to say?"
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center"
                  style={{
                    gap: 8,
                    padding: '10px 12px',
                    borderLeft: '2px solid var(--ide-red)',
                    background: 'var(--ide-red-a12)',
                  }}
                >
                  <AlertCircle size={14} color="var(--ide-red)" />
                  <span style={{ fontSize: 15, fontFamily: sans, color: 'var(--ide-text-2)' }}>
                    {error}
                  </span>
                </div>
              )}

              <div>
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="pf-btn-primary"
                  style={sending ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  <Send size={14} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ide-text-1)',
                  marginBottom: 8,
                }}
              >
                ✓ Message sent
              </div>
              <p style={body}>Got it. I&apos;ll reply as soon as I can.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', subject: '', message: '', website: '' });
                  setError(null);
                }}
                className="hover:underline underline-offset-4"
                style={{
                  marginTop: 16,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ide-accent)',
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: sans,
                }}
              >
                Send another
              </button>
            </div>
          )}
        </IDECard>
      </section>
    </div>
  );
}
