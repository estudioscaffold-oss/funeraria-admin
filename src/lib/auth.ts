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

/**
 * Registro de una nueva funeraria (tenant) como SaaS.
 * 1. Crea la cuenta en Supabase Auth
 * 2. Autentica al nuevo usuario
 * 3. Llama al RPC `crear_funeraria` que crea el tenant + maestro atómicamente
 */
import { supabase } from "./supabase";

export async function registerFuneraria(
  funerariaName: string,
  fullName: string,
  email: string,
  password: string,
): Promise<{ tenantId: string | null; error: string | null }> {
  // 1. Crear cuenta Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (signUpError) return { tenantId: null, error: signUpError.message };
  if (!signUpData.user)
    return { tenantId: null, error: "No se pudo crear el usuario" };

  // 2. Llamar RPC que crea tenant + staff_user maestro
  const { data: tenantId, error: rpcError } = await supabase.rpc(
    "crear_funeraria",
    { p_funeraria_name: funerariaName, p_full_name: fullName },
  );
  if (rpcError) return { tenantId: null, error: rpcError.message };

  return { tenantId: tenantId as string, error: null };
}
