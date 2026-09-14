'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { register } from '../../api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyAuthSession, getAuthErrorMessage, getRedirectPaths } from '../../utils/authFlow';
import AuthCard from '../../components/AuthCard';
import EmailField from '../../components/AuthCard/EmailField';
import PasswordField from '../../components/AuthCard/PasswordField';

const Register = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const { from, redirect } = getRedirectPaths(searchParams);
  const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';

  // Move focus to the error on submit failure so keyboard/screen-reader users
  // aren't left stranded on the submit button with no indication of what happened.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await register({ username, email, password });
      if (applyAuthSession(dispatch, response)) {
        router.replace(from);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard mode="signup" redirectQuery={redirectQuery} formTitle="Create your account">
      <form onSubmit={handleRegister}>
        <label className="mt-[18px] block">
          <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            disabled={loading}
            required
            className="w-full border-b-2 border-[var(--paper-muted-2)] bg-transparent px-0.5 py-[9px] text-[17px] outline-none focus:border-[var(--paper-accent-strong)]"
          />
        </label>

        <EmailField value={email} onChange={setEmail} disabled={loading} />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showStrength
          disabled={loading}
        />

        {error && (
          <p
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="mt-4 text-sm font-bold text-[#8d3a33]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-[26px] w-full -rotate-[0.6deg] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-[26px] py-[14px] font-paper-mono text-sm font-bold uppercase tracking-[.16em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-[18px] border-t border-dashed border-[var(--paper-line)] pt-4 text-[15px] text-[var(--paper-muted)]">
        Already have an account?{' '}
        <Link
          href={`/login${redirectQuery}`}
          className="font-bold text-[var(--paper-accent)] underline underline-offset-[3px] hover:text-[var(--paper-ink)]"
        >
          Sign in instead
        </Link>
      </p>
    </AuthCard>
  );
};

export default Register;
