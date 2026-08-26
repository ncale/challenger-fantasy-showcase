import { createContext } from "react";

interface NetworkStatusContextType {
  isOnline: boolean;
}

export const NetworkStatusContext = createContext<NetworkStatusContextType>({ isOnline: true });
