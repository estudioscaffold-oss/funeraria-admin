import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../types";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
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
    .select("full_name,role")
    .eq("email", user.email)
    .maybeSingle();
  if (!data) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: data.full_name,
    role: data.role as UserRole,
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
    await supabase.auth.signOut();
    setAuthUser(null);
  };

  const setupMaestro = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
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
        isMaestro: authUser?.role === "maestro",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
