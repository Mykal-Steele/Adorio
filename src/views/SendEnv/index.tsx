'use client';
import React, { useState } from 'react';
import { storeSecret } from '../../api';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import PaperTornEdge from '../../components/PaperTornEdge';

const SendEnv = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [storedName, setStoredName] = useState('');
  const [retrievalCommand, setRetrievalCommand] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      if (!name || !message || !password) {
        throw new Error('Please fill in the project name, message, and passphrase');
      }

      if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(name)) {
        throw new Error('Project name must be 3-40 lowercase letters, digits, or dashes');
      }

      if (password.length < 8) {
        throw new Error('Passphrase must be at least 8 characters');
      }

      if (!/^[\x20-\x7e]*[\x21-\x7e]$/.test(password)) {
        throw new Error('Passphrase must use printable ASCII and must not end with whitespace');
      }

      const response = await storeSecret(name, message, password);

      setSuccess(true);
      setStoredName(response.name || name);
      setRetrievalCommand(response.retrievalCommand);

      setName('');
      setMessage('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store secret');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(retrievalCommand).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      },
    );
  };

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            private notes &middot; curl friendly
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            Store a secret message
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            Write something down, lock it with a passphrase, and pull it back later with a single
            command. Sign in to store it — only the passphrase can decrypt it.
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-10 sm:px-8 sm:pt-12">
        <div className="mx-auto max-w-xl">
          <div className="relative rotate-[-0.4deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(24px,3vw,34px)] shadow-[0_20px_34px_-16px_rgba(60,44,24,.4),0_2px_0_rgba(60,44,24,.1)]">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-[30px] h-[26px] w-[92px] rotate-[-3.5deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
            />

            {success ? (
              <div>
                <p className="font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                  stored
                </p>
                <h2 className="mt-1 font-paper-serif text-[27px] font-bold">
                  Your secret is tucked away
                </h2>
                <div className="mt-3 rounded-[2px] border border-[#4f6b3a] bg-[#e8eeda] px-4 py-3 text-sm text-[#3f552e]">
                  <p>
                    Run this on the machine that needs the env file. When it asks, enter{' '}
                    <code className="font-paper-mono font-bold">{storedName}</code> and the
                    passphrase you just set.
                  </p>
                  <p className="mt-1.5">Keep the passphrase safe — there is no reset.</p>
                </div>

                <div className="relative mt-4">
                  <pre className="overflow-x-auto rounded-[2px] border border-[var(--paper-line)] bg-[var(--paper-hero)] p-3 pr-12 font-paper-mono text-[12.5px] leading-[1.6] text-[var(--paper-muted)]">
                    <code>{retrievalCommand}</code>
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-2 top-2 rounded-[2px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-1.5 text-[var(--paper-muted)] transition-colors hover:bg-[var(--paper-yellow-soft)]"
                    title="Copy to clipboard"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                </div>

                {copied && (
                  <p className="mt-2 font-paper-sans text-base text-[var(--paper-accent)]">
                    Copied.
                  </p>
                )}

                <button
                  onClick={() => {
                    setSuccess(false);
                    setStoredName('');
                    setRetrievalCommand('');
                  }}
                  className="mt-6 rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3.5 py-2 text-[13px] font-medium text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
                >
                  Store another secret
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="font-paper-serif text-[27px] font-bold">New note</h2>

                <label className="mt-[22px] block">
                  <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                    Project name
                  </span>
                  <input
                    type="text"
                    placeholder="adorio-prod"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-[1.5px] border-[rgba(60,44,24,.4)] bg-transparent px-3 py-2.5 font-paper-mono text-base outline-none focus:border-[var(--paper-accent-strong)]"
                    pattern="[a-z0-9][a-z0-9-]{2,39}"
                    minLength={3}
                    maxLength={40}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                  />
                  <span className="mt-1.5 block font-paper-sans text-sm leading-tight text-[var(--paper-accent)]">
                    3 to 40 characters. Use lowercase letters, numbers, and dashes.
                  </span>
                </label>

                <label className="mt-5 block">
                  <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                    Secret message
                  </span>
                  <textarea
                    placeholder="Type the thing you don't want to forget"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="paper-ruled min-h-[120px] w-full resize-y border-[1.5px] border-[rgba(60,44,24,.4)] bg-transparent px-3 py-2 text-base leading-8 outline-none focus:border-[var(--paper-accent-strong)]"
                    required
                  />
                </label>

                <label className="mt-5 block">
                  <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                    Passphrase
                  </span>
                  <input
                    type="password"
                    placeholder="Five or six random words"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-[1.5px] border-[rgba(60,44,24,.4)] bg-transparent px-3 py-2.5 text-base outline-none focus:border-[var(--paper-accent-strong)]"
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <span className="mt-1.5 block font-paper-sans text-sm leading-tight text-[var(--paper-accent)]">
                    At least 8 characters, with no space at the end. It can&apos;t be reset, so keep
                    it somewhere safe.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full -rotate-[0.6deg] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-[26px] py-[14px] font-paper-mono text-sm font-bold uppercase tracking-[.16em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-60"
                >
                  {isSubmitting ? 'Storing…' : 'Store secret'}
                </button>

                {error && (
                  <p className="mt-4 rounded-[2px] border border-[#8d3a33] bg-[#f3ded9] px-3 py-2 text-sm text-[#7a2f29]">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>

          <p className="mt-6 text-center font-paper-sans text-base text-[var(--paper-muted)]">
            You need to be logged in to save. A lost passphrase can&apos;t be recovered.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SendEnv;
