/**
 * Auth helpers — user creation uses a non-persisting client so the
 * maestro's session is never overwritten when creating other accounts.
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const ghostClient = createClient(url || "http://localhost", key || "anon", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function createAuthUser(
  email: string,
  password: string,
): Promise<{ userId: string | null; error: string | null }> {
  const { data, error } = await ghostClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { userId: null, error: error.message };
  return { userId: data.user?.id ?? null, error: null };
}
