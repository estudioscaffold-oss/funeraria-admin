import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { setCurrentTenantId } from "../lib/db";
import type { UserRole } from "../types";

interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: UserRole;
  deceasedId?: string;
}

interface AuthContextType {
  session: Session | null;
  authUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  setupMaestro: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  isMaestro: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

async function fetchProfile(user: User): Promise<AuthUser | null> {
  const { data } = await supabase
    .from("staff_users")
    .select("id,tenant_id,full_name,role,deceased_id")
    .eq("email", user.email)
    .maybeSingle();
  if (!data) return null;
  /* sincronizar tenant activo para que dbCollections lo incluya en upserts */
  setCurrentTenantId(data.tenant_id ?? null);
  return {
    id: data.id,
    tenantId: data.tenant_id ?? "",
    email: user.email ?? "",
    fullName: data.full_name,
    role: data.role as UserRole,
    deceasedId: data.deceased_id ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user);
        setAuthUser(profile);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const profile = await fetchProfile(newSession.user);
          setAuthUser(profile);
        } else {
          setAuthUser(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  };

  const logout = async () => {
    setCurrentTenantId(null);
    /* limpiar caché local para que el próximo tenant no vea datos ajenos */
    Object.keys(localStorage)
      .filter((k) => k.startsWith("veladesk-"))
      .forEach((k) => localStorage.removeItem(k));
    await supabase.auth.signOut();
    setAuthUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user);
      setAuthUser(profile);
    }
  };

  const setupMaestro = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return error.message;
    if (!data.user) return "No se pudo crear el usuario";

    const { error: dbErr } = await supabase.from("staff_users").insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role: "maestro",
      active: true,
      created_at: new Date().toISOString(),
    });
    if (dbErr) return dbErr.message;
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        authUser,
        loading,
        login,
        logout,
        setupMaestro,
        refreshProfile,
        isMaestro: authUser?.role === "maestro",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
