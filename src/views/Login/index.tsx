'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { login } from '../../api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyAuthSession, getAuthErrorMessage, getRedirectPaths } from '../../utils/authFlow';
import AuthCard from '../../components/AuthCard';
import EmailField from '../../components/AuthCard/EmailField';
import PasswordField from '../../components/AuthCard/PasswordField';

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
      if (applyAuthSession(dispatch, response, remember)) {
        router.replace(from);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Login failed. Please check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard mode="signin" redirectQuery={redirectQuery} formTitle="Sign in">
      <form onSubmit={handleLogin}>
        <EmailField value={email} onChange={setEmail} disabled={loading} />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={loading}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3.5">
          <label className="flex cursor-pointer items-center gap-[9px] text-[14.5px]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-[17px] w-[17px] cursor-pointer accent-[var(--paper-accent-strong)]"
            />
            Keep me signed in
          </label>
          <Link href="/contact" className="text-[14.5px]">
            Forgot password?
          </Link>
        </div>

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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-[18px] border-t border-dashed border-[var(--paper-line)] pt-4 text-[15px] text-[var(--paper-muted)]">
        No account yet?{' '}
        <Link
          href={`/register${redirectQuery}`}
          className="font-bold text-[var(--paper-accent)] underline underline-offset-[3px] hover:text-[var(--paper-ink)]"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;
