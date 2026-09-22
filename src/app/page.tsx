import { redirect } from 'next/navigation';

import { Dashboard } from '@/components/dashboard/dashboard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect('/login');

  const displayName =
    typeof data.user.user_metadata.display_name === 'string'
      ? data.user.user_metadata.display_name
      : data.user.email?.split('@')[0] ?? 'Friend';

  return (
    <Dashboard
      user={{
        name: displayName,
        email: data.user.email ?? '',
      }}
    />
  );
}
