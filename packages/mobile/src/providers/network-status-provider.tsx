// src/context/NetworkContext.tsx
import NetInfo from "@react-native-community/netinfo";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { mobileLogger } from "~/lib/logger";

const NetworkStatusContext = createContext(true);

export const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);
  const isFirstEvent = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      if (isFirstEvent.current) {
        isFirstEvent.current = false;
        mobileLogger.lifecycle.info({ isConnected: connected }, "network.init");
      } else {
        mobileLogger.lifecycle.info({ isConnected: connected }, "network.change");
      }
      setIsConnected(connected);
    });
    return unsubscribe;
  }, []);

  return (
    <NetworkStatusContext.Provider value={isConnected}>{children}</NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkStatusContext);
