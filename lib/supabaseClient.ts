import { createClient } from '@supabase/supabase-js';

// Client-side only — safe to use in the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
