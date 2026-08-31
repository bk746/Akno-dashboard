"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type AuthResult = { error: Error | null; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<{ error: Error | null; sent?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    const finishLoading = (nextSession: Session | null) => {
      if (cancelled) return;
      setSession((current) => nextSession ?? current);
      setUser((current) => nextSession?.user ?? current);
      setLoading(false);
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 12000);

    supabase.auth
      .getSession()
      .then(({ data: { session: nextSession } }) => {
        window.clearTimeout(timeoutId);
        finishLoading(nextSession);
      })
      .catch(() => {
        window.clearTimeout(timeoutId);
        finishLoading(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn: async (email, password) => {
        if (!supabase) return { error: new Error("Supabase non configuré") };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.code === "email_not_confirmed") {
            return {
              error: null,
              needsEmailConfirmation: true,
            };
          }
          return { error: new Error(error.message) };
        }
        if (!data.session) {
          return {
            error: new Error(
              "Connexion impossible. Vérifiez votre email ou désactivez la confirmation email dans Supabase.",
            ),
          };
        }
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
        return { error: null };
      },
      signUp: async (email, password) => {
        if (!supabase) return { error: new Error("Supabase non configuré") };
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });
        if (error) return { error: new Error(error.message) };
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
        } else {
          return { error: null, needsEmailConfirmation: true };
        }
        return { error: null };
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
      resetPassword: async (email) => {
        if (!supabase) return { error: new Error("Supabase non configuré") };
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) return { error: new Error(error.message) };
        return { error: null, sent: true };
      },
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}

export { isSupabaseConfigured };
