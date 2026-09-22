'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ArrowRight, Check, LockKeyhole, Mail, UserRound } from 'lucide-react';

import type { AuthFormState } from '@/features/auth/auth-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthAction = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function AuthForm({
  mode,
  action,
  initialMessage,
}: {
  mode: 'login' | 'signup';
  action: AuthAction;
  initialMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === 'signup';
  const message = state.message ?? initialMessage;

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Craftask introduction">
        <Link href="/" className="auth-brand">
          <span className="brand-mark"><Check size={21} strokeWidth={3} /></span>
          <span>craftask<span className="brand-dot">.</span></span>
        </Link>
        <div className="auth-story-copy">
          <span className="section-kicker">YOUR QUIET PRODUCTIVITY SPACE</span>
          <h1>Make room for what matters.</h1>
          <p>Gather your tasks, shape your day, and move forward with a little more clarity.</p>
        </div>
        <p className="auth-quote">Progress can be gentle and still take you somewhere meaningful.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="auth-eyebrow">{isSignup ? 'BEGIN YOUR SPACE' : 'WELCOME BACK'}</span>
          <h2>{isSignup ? 'Create your account' : 'Sign in to Craftask'}</h2>
          <p className="auth-subtitle">
            {isSignup
              ? 'A calmer way to organize your days starts here.'
              : 'Your tasks and plans are right where you left them.'}
          </p>

          <form action={formAction} className="auth-form">
            {isSignup && (
              <AuthField
                id="name"
                name="name"
                label="Your name"
                placeholder="How should we greet you?"
                autoComplete="name"
                icon={<UserRound size={17} />}
                errors={state.errors?.name}
              />
            )}
            <AuthField
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={17} />}
              errors={state.errors?.email}
            />
            <AuthField
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              icon={<LockKeyhole size={17} />}
              errors={state.errors?.password}
            />

            {message && (
              <p className={state.success ? 'auth-message success' : 'auth-message'} role="status">
                {message}
              </p>
            )}

            <Button className="auth-submit" type="submit" disabled={pending}>
              {pending ? 'Just a moment…' : isSignup ? 'Create my space' : 'Sign in'}
              {!pending && <ArrowRight size={17} />}
            </Button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Craftask?'}{' '}
            <Link href={isSignup ? '/login' : '/signup'}>
              {isSignup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  id,
  label,
  icon,
  errors,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  errors?: string[];
}) {
  const errorId = `${id}-error`;

  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className="auth-input-wrap">
        {icon}
        <Input
          {...props}
          id={id}
          required
          aria-invalid={Boolean(errors?.length)}
          aria-describedby={errors?.length ? errorId : undefined}
        />
      </span>
      {errors?.map((error) => (
        <small id={errorId} className="auth-field-error" key={error}>{error}</small>
      ))}
    </label>
  );
}

