import { redirect } from 'next/navigation';

import { signup } from '@/app/auth/actions';
import { AuthForm } from '@/components/auth/auth-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = { title: 'Create an account — Craftask' };

export default async function SignupPage() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) redirect('/');
  } catch {
    // Ignore fetch error when Supabase is unreachable
  }

  return <AuthForm mode="signup" action={signup} />;
}

