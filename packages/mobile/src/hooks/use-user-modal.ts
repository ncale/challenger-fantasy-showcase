import { useContext } from "react";
import { UserModalContext } from "~/contexts/user-modal-context";

export function useUserModal() {
  const ctx = useContext(UserModalContext);
  return ctx ?? { openUser: (_userId: string) => {} };
}
