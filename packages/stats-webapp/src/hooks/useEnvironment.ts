import { useEffect, useState } from "react";

type BrowserEnvironment = {
  browser: string;
  browserVersion: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
};

// Utility functions to detect browser/OS
const getBrowser = (): string => {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";

  return "Unknown";
};

const getBrowserVersion = (): string => {
  const ua = navigator.userAgent;
  const browser = getBrowser();

  const versionRegexMap: Record<string, RegExp> = {
    Firefox: /Firefox\/([0-9.]+)/,
    Edge: /Edg\/([0-9.]+)/,
    Chrome: /Chrome\/([0-9.]+)/,
    Safari: /Version\/([0-9.]+)/,
  };

  const match = ua.match(versionRegexMap[browser] || /./);
  return match?.[1] || "Unknown";
};

const getOS = (): string => {
  const ua = navigator.userAgent;

  if (/Windows/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "MacOS";
  if (/Linux/.test(ua)) return "Linux";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";

  return "Unknown";
};

const getDeviceType = () => {
  const ua = navigator.userAgent;

  // Tablet detection
  const isTablet =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
      ua.toLowerCase(),
    );

  // Mobile detection
  const isMobile =
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    );

  return {
    isTablet,
    isMobile: !isTablet && isMobile,
    isDesktop: !isTablet && !isMobile,
  };
};

export const useEnvironment = (): BrowserEnvironment => {
  const [env, setEnv] = useState<BrowserEnvironment>({
    browser: "Unknown",
    browserVersion: "Unknown",
    os: "Unknown",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isEdge: false,
  });

  useEffect(() => {
    const browser = getBrowser();
    const deviceType = getDeviceType();
    const os = getOS();

    setEnv({
      browser,
      browserVersion: getBrowserVersion(),
      os,
      ...deviceType,
      isIOS: os === "iOS",
      isAndroid: os === "Android",
      isSafari: browser === "Safari",
      isChrome: browser === "Chrome",
      isFirefox: browser === "Firefox",
      isEdge: browser === "Edge",
    });
  }, []);

  return env;
};
