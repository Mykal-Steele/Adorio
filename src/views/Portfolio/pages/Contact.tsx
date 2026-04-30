'use client';

import { useState } from 'react';
import { Send, GithubIcon, LinkedinIcon, Mail, AlertCircle } from 'lucide-react';
import { sendContactMessage } from '../../../api';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, PageHeader } from '../shared';

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
];

const fields = [
  { key: 'name', label: 'name', placeholder: 'Your name', type: 'input' },
  { key: 'email', label: 'email', placeholder: 'your@email.com', type: 'input' },
  { key: 'subject', label: 'subject', placeholder: 'What is this about?', type: 'input' },
] as const;

export function Contact() {
  const { isMobile } = useResponsive();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}
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
                border: '1px solid var(--ide-border)',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${ch.color}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ide-border)';
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: ch.color }}>
                {ch.icon}
                <span
                  style={{
                    fontSize: 10,
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
                  fontSize: 11,
                  fontFamily: mono,
                  color: 'var(--ide-text-5)',
                  marginBottom: 6,
                }}
              >
                {ch.value}
              </div>
              <div style={{ fontSize: 10, fontFamily: vietnam, color: 'var(--ide-text-6)' }}>
                {ch.description}
              </div>
            </a>
          ))}
        </div>

        <div
          style={{
            fontSize: 9,
            fontFamily: sans,
            color: 'var(--ide-text-6)',
            letterSpacing: '0.1em',
            marginBottom: 12,
          }}
        >
          Send a message
        </div>

        {!sent ? (
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`contact-${field.key}`}
                  style={{
                    display: 'block',
                    fontSize: 9,
                    fontFamily: mono,
                    color: focused === field.key ? 'var(--ide-accent)' : 'var(--ide-text-6)',
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
                    background: 'var(--ide-bg-1)',
                    border: `1px solid ${focused === field.key ? 'var(--ide-accent-a30)' : 'var(--ide-border)'}`,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontFamily: mono,
                    color: 'var(--ide-text-2)',
                    outline: 'none',
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
                  fontSize: 9,
                  fontFamily: mono,
                  color: focused === 'message' ? 'var(--ide-accent)' : 'var(--ide-text-6)',
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
                  background: 'var(--ide-bg-1)',
                  border: `1px solid ${focused === 'message' ? 'var(--ide-accent-a30)' : 'var(--ide-border)'}`,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontFamily: mono,
                  color: 'var(--ide-text-2)',
                  outline: 'none',
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
                  border: '1px solid var(--ide-red)',
                  borderRadius: 2,
                }}
              >
                <AlertCircle size={12} color="var(--ide-red)" />
                <span style={{ fontSize: 11, fontFamily: sans, color: 'var(--ide-red)' }}>
                  {error}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-3 transition-opacity hover:opacity-90"
              style={{
                background: sending ? 'var(--ide-accent-a30)' : 'var(--ide-accent-light)',
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: 11,
                fontFamily: sans,
                fontWeight: 700,
                color: 'var(--ide-accent-dark)',
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
              border: '1px solid var(--ide-accent-a20)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: mono,
                color: 'var(--ide-accent)',
                marginBottom: 8,
              }}
            >
              ✓ Message sent
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: vietnam,
                color: 'var(--ide-text-2)',
                lineHeight: 1.6,
              }}
            >
              Got it. I&apos;ll get back to you within 24 hours.
            </div>
            <button
              onClick={() => {
                setSent(false);
                setForm({ name: '', email: '', subject: '', message: '' });
                setError(null);
              }}
              style={{
                marginTop: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ide-accent)',
                fontSize: 10,
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
