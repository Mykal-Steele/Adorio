'use client';

import { useState } from 'react';
import { Send, GithubIcon, LinkedinIcon, Mail, AlertCircle, Code } from 'lucide-react';
import { sendContactMessage } from '../../../api';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, PageHeader, SectionLabel } from '../shared';

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
    color: 'var(--ide-accent)',
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

export function Contact() {
  const { isMobile } = useResponsive();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [focused, setFocused] = useState<string | null>(null);
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
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'contact.sh']} language="Shell Script" />

      <div
        className={isMobile ? 'px-4 py-6' : 'px-8 py-8'}
        style={{ maxWidth: 640, margin: '0 auto' }}
      >
        <div style={{ marginBottom: 32 }}>
          <PageHeader
            title="Contact"
            subtitle="Use the channels below or send a message directly."
          />
        </div>

        <div
          className="grid gap-3 mb-10"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
        >
          {channels.map((ch) => (
            <a
              key={ch.id}
              href={ch.href}
              target="_blank"
              rel="noreferrer"
              className="text-left p-4 transition-all block"
              style={{
                background: 'var(--ide-bg-2)',
                border: '2px solid var(--nb-border)',
                boxShadow: '3px 3px 0 var(--nb-shadow)',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(-2px, -2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0 var(--nb-shadow)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 var(--nb-shadow)';
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: ch.color }}>
                {ch.icon}
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: sans,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {ch.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: mono,
                  color: 'var(--ide-text-4)',
                  marginBottom: 6,
                }}
              >
                {ch.value}
              </div>
              <div style={{ fontSize: 14, fontFamily: vietnam, color: 'var(--ide-text-4)' }}>
                {ch.description}
              </div>
            </a>
          ))}
        </div>

        <SectionLabel>Send a message</SectionLabel>

        {!sent ? (
          <div className="space-y-3">
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
                <label
                  htmlFor={`contact-${field.key}`}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontFamily: mono,
                    color: focused === field.key ? 'var(--ide-accent)' : 'var(--ide-text-4)',
                    marginBottom: 4,
                    transition: 'color 0.15s',
                  }}
                >
                  {field.label}
                </label>
                <input
                  id={`contact-${field.key}`}
                  value={form[field.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  onFocus={() => setFocused(field.key)}
                  onBlur={() => setFocused(null)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    background: 'var(--ide-bg-0)',
                    border: `2px solid ${focused === field.key ? 'var(--ide-accent)' : 'var(--nb-border)'}`,
                    padding: '10px 12px',
                    fontSize: 16,
                    fontFamily: mono,
                    color: 'var(--ide-text-2)',
                    transition: 'border-color 0.15s',
                  }}
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="contact-message"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontFamily: mono,
                  color: focused === 'message' ? 'var(--ide-accent)' : 'var(--ide-text-4)',
                  marginBottom: 4,
                  transition: 'color 0.15s',
                }}
              >
                message
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                placeholder="What do you want to say?"
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--ide-bg-0)',
                  border: `2px solid ${focused === 'message' ? 'var(--ide-accent)' : 'var(--nb-border)'}`,
                  padding: '10px 12px',
                  fontSize: 16,
                  fontFamily: mono,
                  color: 'var(--ide-text-2)',
                  resize: 'vertical',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: 'var(--ide-red-a12)',
                  border: '2px solid var(--ide-red)',
                }}
              >
                <AlertCircle size={12} color="var(--ide-red)" />
                <span style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-red)' }}>
                  {error}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-3 transition-opacity hover:opacity-90"
              style={{
                background: sending ? 'var(--ide-accent-a30)' : 'var(--nb-accent)',
                border: '2px solid var(--nb-border)',
                boxShadow: '3px 3px 0 var(--nb-shadow)',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontFamily: sans,
                fontWeight: 700,
                color: sending ? 'var(--ide-text-2)' : 'var(--nb-on-accent)',
                letterSpacing: '0.08em',
              }}
            >
              <Send size={12} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        ) : (
          <div
            className="p-6"
            style={{
              background: 'var(--ide-accent-a6)',
              border: '2px solid var(--nb-border)',
              boxShadow: '4px 4px 0 var(--nb-shadow)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontFamily: mono,
                color: 'var(--ide-accent)',
                marginBottom: 8,
              }}
            >
              ✓ Message sent
            </div>
            <div
              style={{
                fontSize: 16,
                fontFamily: vietnam,
                color: 'var(--ide-text-2)',
                lineHeight: 1.6,
              }}
            >
              Got it. I&apos;ll reply as soon as I can.
            </div>
            <button
              onClick={() => {
                setSent(false);
                setForm({ name: '', email: '', subject: '', message: '', website: '' });
                setError(null);
              }}
              style={{
                marginTop: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ide-accent)',
                fontSize: 13,
                fontFamily: mono,
              }}
            >
              Send another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
