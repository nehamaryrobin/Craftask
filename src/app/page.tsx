import { redirect } from 'next/navigation';

import { Dashboard } from '@/components/dashboard/dashboard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  let user = { name: 'Alex', email: 'alex@example.com' };

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
      const displayName =
        typeof data.user.user_metadata?.display_name === 'string'
          ? data.user.user_metadata.display_name
          : data.user.email?.split('@')[0] ?? 'Friend';

      user = {
        name: displayName,
        email: data.user.email ?? '',
      };
    }
  } catch {
    // Fallback to mock user when Supabase is unconfigured or unreachable
  }

  return <Dashboard user={user} />;
}
