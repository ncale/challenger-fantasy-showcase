import { isNotNullish } from "@challenger-fantasy/core";
import {
  sendOtpInputSchema,
  setUsernameInputSchema,
  verifyOtpInputSchema,
} from "@challenger-fantasy/schemas";
import type { Session, User } from "@supabase/supabase-js";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "./supabase-server";

type CheckAuthStatusFnResponse =
  | { isAuthenticated: false; user: null; session: null }
  | { isAuthenticated: true; user: User; session: Session };

export const checkAuthStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CheckAuthStatusFnResponse> => {
    const supabase = getSupabaseServerClient();

    const [{ data, error }, { data: sessionData, error: sessionError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession(),
    ]);

    if (error || sessionError || !sessionData.session)
      return { isAuthenticated: false, user: null, session: null };

    return { isAuthenticated: true, user: data.user, session: sessionData.session };
  },
);

export const sendOtpFn = createServerFn({ method: "POST" })
  .inputValidator(sendOtpInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Build user metadata with referral info if provided
    const userMetadata: Record<string, string> = {};
    if (data.referralCode) {
      // Look up referrer by code
      const { data: referrer } = await supabase
        .schema("public")
        .from("user_account")
        .select("user_id")
        .eq("referral_code", data.referralCode.toUpperCase())
        .single();

      if (referrer) {
        userMetadata.referred_by = referrer.user_id;
      }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: true,
        data: Object.keys(userMetadata).length > 0 ? userMetadata : undefined,
      },
    });

    if (error) {
      return { error: true, message: error.message };
    }

    return { error: false };
  });

export const verifyOtpFn = createServerFn({ method: "POST" })
  .inputValidator(verifyOtpInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.auth.verifyOtp({
      email: data.email,
      token: data.token,
      type: "email",
    });

    if (error) {
      return { error: true, message: error.message, hasUsername: false };
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { error: true, message: "User not found", hasUsername: false };
    }

    const { data: profile } = await supabase
      .schema("public")
      .from("user_profile")
      .select("username")
      .eq("user_id", userData.user.id)
      .single();

    return {
      error: false,
      hasUsername: isNotNullish(profile?.username),
    };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) throw new Error("Logout failed");

  throw redirect({ to: "/join" });
});

export const setUsernameFn = createServerFn({ method: "POST" })
  .inputValidator(setUsernameInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Verify user is authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { error: true, message: "Not authenticated" };
    }

    // Check username availability (case-insensitive)
    const { data: existing } = await supabase
      .schema("public")
      .from("user_profile")
      .select("username")
      .ilike("username", data.username)
      .single();

    if (existing?.username) {
      return { error: true, message: "Username is already taken" };
    }

    // Update user profile with username
    const { error: updateError } = await supabase
      .schema("public")
      .from("user_profile")
      .update({ username: data.username })
      .eq("user_id", userData.user.id);

    if (updateError) {
      return { error: true, message: updateError.message };
    }

    return { error: false };
  });
