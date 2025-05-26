import { atom } from "nanostores";
import type { Session } from "@supabase/supabase-js";
import { profileStore } from "./profileStore";
import { supabase } from "@lib/supabase";

interface AuthState {
  user: any | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const authStore = atom<AuthState>({
  user: null,
  session: null,
  loading: true,
  error: null,
});

export async function initAuth(accessToken?: string, refreshToken?: string) {
  authStore.set({ user: null, session: null, loading: true, error: null });

  if (!accessToken || !refreshToken) {
    authStore.set({ user: null, session: null, loading: false, error: "No tokens" });
    return;
  }

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      authStore.set({
        user: null,
        session: null,
        loading: false,
        error: error?.message ?? "Failed to set session",
      });
      return;
    }

    authStore.set({ user: data.user, session: data.session, loading: false, error: null });

    if (!profileStore.get()) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile && !profileError) {
        profileStore.set(profile);
      }
    }
  } catch (err: any) {
    authStore.set({
      user: null,
      session: null,
      loading: false,
      error: err.message ?? "Unknown error",
    });
  } finally {
    authStore.set({
      ...authStore.get(),
      loading: false,
    });
  }
}