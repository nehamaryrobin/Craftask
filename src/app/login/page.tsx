import { redirect } from 'next/navigation';

import { login } from '@/app/auth/actions';
import { AuthForm } from '@/components/auth/auth-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = { title: 'Sign in — Craftask' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/');

  const { error } = await searchParams;
  const initialMessage = error
    ? 'That confirmation link is invalid or has expired. Please try again.'
    : undefined;

  return <AuthForm mode="login" action={login} initialMessage={initialMessage} />;
}

