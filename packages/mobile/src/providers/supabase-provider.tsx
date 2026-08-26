import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { SupabaseContext } from "~/contexts/supabase-context";
import { env } from "~/lib/env";
import { deleteAccountMutation, userProfileQuery } from "~/lib/init-queries";
import { mobileLogger } from "~/lib/logger";
import { supabase } from "~/lib/supabase";

const log = mobileLogger.auth;

// Pre-created Supabase accounts for demo / App Store review.
// Activate by setting EXPO_PUBLIC_ENABLE_DEMO=true and EXPO_PUBLIC_REVIEWER_PASSWORD.
const DEMO_ACCOUNTS = [
  { email: "test1@challengerfantasy.com", code: "123456" },
  { email: "test2@challengerfantasy.com", code: "123456" },
  { email: "test3@challengerfantasy.com", code: "123456" },
  { email: "test4@challengerfantasy.com", code: "123456" },
  { email: "test5@challengerfantasy.com", code: "123456" },
] as const;

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoaded(true);
      log.info({ userId: data.session?.user?.id ?? null }, "session.restore");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      log.info({ event, userId: newSession?.user?.id ?? null }, "session.change");
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const { data: profile, isLoading: isProfileLoading } = useQuery(
    userProfileQuery(session?.user?.id ?? ""),
  );

  const userId = useMemo(() => session?.user?.id, [session]);
  const accessToken = session?.access_token ?? "";

  const { mutateAsync: deleteAccountAsync, isPending: isDeletingAccount } = useMutation(
    deleteAccountMutation(accessToken),
  );

  const signInWithOtp = async (email: string) => {
    if ((__DEV__ || env.EXPO_PUBLIC_ENABLE_DEMO) && env.EXPO_PUBLIC_REVIEWER_PASSWORD) {
      const isDemoAccount = DEMO_ACCOUNTS.some((a) => a.email === email);
      if (isDemoAccount) {
        log.info({}, "otp.demo.bypass");
        return;
      }
    }

    log.info({}, "otp.request");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      log.error({ code: error.status }, "otp.request.error");
      throw error;
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    if ((__DEV__ || env.EXPO_PUBLIC_ENABLE_DEMO) && env.EXPO_PUBLIC_REVIEWER_PASSWORD) {
      const demoAccount = DEMO_ACCOUNTS.find((a) => a.email === email && a.code === code);
      if (demoAccount) {
        log.info({}, "otp.demo.signin");
        const { error } = await supabase.auth.signInWithPassword({
          email: demoAccount.email,
          password: env.EXPO_PUBLIC_REVIEWER_PASSWORD,
        });
        if (error) {
          log.error({ code: error.status }, "otp.demo.error");
          throw error;
        }
        return;
      }
    }

    log.info({}, "otp.verify");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) {
      log.error({ code: error.status }, "otp.verify.error");
      throw error;
    }
    log.info({}, "otp.verify.success");
  };

  const signOut = async () => {
    if (!supabase) return;
    log.info({ userId }, "session.signout");
    await supabase.auth.signOut();
    setSession(null);
  };

  const deleteAccount = async () => {
    if (!supabase) return;
    if (!accessToken) throw new Error("Not authenticated");
    log.warn({ userId }, "account.delete");
    await deleteAccountAsync();
    await supabase.auth.signOut();
    setSession(null);
    log.info({ userId }, "account.delete.success");
  };

  const updateAvatarUrl = async (avatarUrl: string) => {
    if (!userId || !supabase) return;

    queryClient.setQueryData(userProfileQuery(userId).queryKey, (prev) => {
      if (!prev) return prev;
      return { ...prev, avatarUrl, updatedAt: new Date().toISOString() };
    });

    const { error } = await supabase
      .from("user_profile")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", userId);
    if (error) throw error;
  };

  const updateUsername = async (username: string) => {
    if (!userId || !supabase) return;

    queryClient.setQueryData(userProfileQuery(userId).queryKey, (prev) => {
      if (!prev) return prev;
      return { ...prev, username, updatedAt: new Date().toISOString() };
    });

    const { error } = await supabase
      .from("user_profile")
      .update({ username })
      .eq("user_id", userId);
    if (error) throw error;
  };

  return (
    <SupabaseContext.Provider
      value={{
        isLoaded,
        isProfileLoading,
        session,
        profile,
        userId,
        signOut,
        signInWithOtp,
        verifyOtp,
        updateAvatarUrl,
        updateUsername,
        deleteAccount,
        isDeletingAccount,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
