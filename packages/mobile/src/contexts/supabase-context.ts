import type { UserProfileDto } from "@challenger-fantasy/schemas";
import type { Session } from "@supabase/supabase-js";
import { createContext } from "react";

interface SupabaseContextType {
  isLoaded: boolean;
  isProfileLoading: boolean;
  session: Session | null;
  profile: UserProfileDto | undefined;
  userId: string | undefined;
  signOut: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  updateAvatarUrl: (avatarUrl: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
}

export const SupabaseContext = createContext<SupabaseContextType | null>(null);
