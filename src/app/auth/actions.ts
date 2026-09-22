'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { loginSchema, signupSchema, type AuthFormState } from '@/features/auth/auth-schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function validationState(error: { flatten: () => { fieldErrors: AuthFormState['errors'] } }) {
  return {
    errors: error.flatten().fieldErrors,
    message: 'Please check the highlighted fields.',
  } satisfies AuthFormState;
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return validationState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: 'The email or password is incorrect.' };
  }

  redirect('/');
}

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return validationState(parsed.error);

  const requestHeaders = await headers();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get('origin') ??
    'http://localhost:3000';
  const emailRedirectTo = new URL('/auth/callback', siteUrl).toString();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo,
    },
  });

  if (error) {
    return { message: 'We could not create your account. Please try again.' };
  }

  if (data.session) redirect('/');

  return {
    success: true,
    message: 'Check your email to confirm your account, then sign in.',
  };
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

