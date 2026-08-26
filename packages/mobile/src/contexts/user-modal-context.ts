import { createContext } from "react";

interface UserModalContextType {
  openUser: (userId: string) => void;
}

export const UserModalContext = createContext<UserModalContextType | null>(null);
