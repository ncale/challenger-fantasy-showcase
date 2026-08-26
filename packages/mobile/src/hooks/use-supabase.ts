import { useContext } from "react";
import { SupabaseContext } from "~/contexts/supabase-context";

export const useSupabase = () => {
  const supabaseContext = useContext(SupabaseContext);
  if (!supabaseContext) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return supabaseContext;
};
